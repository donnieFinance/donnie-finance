package com.ezfarm.donnie.zookeeper.exception;

import lombok.extern.slf4j.Slf4j;
import org.apache.zookeeper.KeeperException.ConnectionLossException;
import org.apache.zookeeper.KeeperException.NoNodeException;
import org.apache.zookeeper.KeeperException.NodeExistsException;

@Slf4j
public class RegExceptionHandler {
    public static void handleException(final Exception cause) {
        if (isIgnoredException(cause) || isIgnoredException(cause.getCause())) {
            log.debug("Job-scheduler: ignored exception for: {}", cause.getMessage());
        } else if (cause instanceof InterruptedException) {
            Thread.currentThread().interrupt();
        } else {
            throw new RegException(cause);
        }
    }

    private static boolean isIgnoredException(final Throwable cause) {
        return null != cause
                && (cause instanceof ConnectionLossException || cause instanceof NoNodeException || cause instanceof NodeExistsException);
    }
}