import time

from django.conf import settings
from django.db.transaction import TransactionManagementError


# Might be necessary in the future for offsetting DB delays.

DJANGO_SAVE_TIME = 0  # int(0.322 * 1000)  # average save time in django (ms).
REDIS_SAVE_TIME = 0  # int(0.101 * 1000)  # average save time in redis instance
REDIS_GET_TIME = 0  # int(0.087 * 1000)  # average get time in redis instance (ms).


def time_it(f):
    # For timing the delay between start and end of a function call.
    def wrap(*args):
        t_0 = current_time()
        result = f(*args)
        time_difference = time_since(t_0)
        return result, time_difference

    return wrap


def get_user_info(username):
    # TODO: Investigate time delay difference in getting four entries instead of getting one entry,
    # TODO: and deserializing it.
    stream_batch = [
        title_label(username),
        src_label(username),
        time_label(username),
        position_label(username),
    ]

    data, delay = get_batch(stream_batch)

    return user_data_dict_from_record(data)


def set_user_info(username, dictionary):
    # TODO: Investigate time delay difference in setting four entries instead of getting one entry,
    # TODO: and deserializing it.

    offset = 4 * REDIS_SAVE_TIME

    _batch = {
        title_label(username): dictionary['title'],
        src_label(username): dictionary['src'],
        time_label(username): dictionary['time'] + offset,
        position_label(username): dictionary['position'] + offset,
    }

    response, delay = save_batch(_batch)

    return response


def delete_user_info(username):
    stream_batch = [
        title_label(username),
        src_label(username),
        time_label(username),
        position_label(username),
    ]

    response, delay = delete_batch(stream_batch)

    return response


@time_it
def get_from_redis(item):
    return settings.REDIS_CLIENT.get(item)


@time_it
def set_to_redis(key, value):
    return settings.REDIS_CLIENT.set(key, value)


@time_it
def delete_batch(list_of_items):
    with settings.REDIS_CLIENT.pipeline() as _pipeline:
        for item in list_of_items:
            _pipeline.delete(item)

        result = _pipeline.execute()

        return result


@time_it
def save_batch(dictionary):
    with settings.REDIS_CLIENT.pipeline() as _pipeline:
        for k, v in dictionary.iteritems():
            _pipeline.set(k, v)

        result = _pipeline.execute()
        _validate_result(result, request_type='SET')

        return result


@time_it
def get_batch(list_of_items):
    with settings.REDIS_CLIENT.pipeline() as _pipeline:
        for item in list_of_items:
            _pipeline.get(item)

        result_list = _pipeline.execute()
        _validate_result(result_list, request_type='GET')

        return zip(list_of_items, result_list)


def _validate_result(batch, request_type):
    if not all(batch):
        if request_type == 'GET':
            raise RedisGetTransactionFailure(
                'Some entries were not retrieved from Redis. Batch: `{}`'.format(str(batch))
            )
        elif request_type == 'SET':
            raise RedisSetTransactionFailure(
                'Some entries were not set to Redis. Batch: `{}`'.format(str(batch))
            )
        else:
            raise RedisTransactionFailure(
                'request_type is not defined. Batch `{}`'.format(str(batch))
            )


def current_time():
    # milliseconds
    return int(time.time() * 1000)


def time_since(t_ms):
    return current_time() - int(t_ms)


def time_label(username):
    """
    Used for setting/getting user info in redis. Should be identical to 'constants' in app.js
    """

    return username + '_time'


def position_label(username):
    """
    Used for setting/getting user info in redis. Should be identical to 'constants' in app.js
    """

    return username + '_position'


def src_label(username):
    """
    Used for setting/getting user info in redis. Should be identical to 'constants' in app.js
    """

    return username + '_src'


def title_label(username):
    """
    Used for setting/getting user info in redis. Should be identical to 'constants' in app.js
    """

    return username + '_title'


def from_label(label):
    # TODO: devise better scheme for storing entries in Redis.
    return label.split('_')[-1]


def dict_from_label(dictionary):
    return {from_label(k): v for k, v in dictionary}


def user_data_dict_from_record(record):
    user_data = dict_from_label(record)

    user_data['position'] = int(user_data['position']) + 4 * REDIS_GET_TIME
    user_data['time'] = int(user_data['time']) + 4 * REDIS_GET_TIME

    return user_data


class RedisTransactionFailure(TransactionManagementError):
    pass


class RedisSetTransactionFailure(RedisTransactionFailure):
    pass


class RedisGetTransactionFailure(RedisTransactionFailure):
    pass
