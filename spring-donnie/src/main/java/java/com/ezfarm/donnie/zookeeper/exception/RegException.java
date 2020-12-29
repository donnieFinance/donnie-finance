package com.ezfarm.donnie.zookeeper.exception;

public class RegException extends RuntimeException {

    private static final long serialVersionUID = -1000723602544550632L;

    public RegException(final String errorMessage, final Object... args) {
        super(String.format(errorMessage, args));
    }

    public RegException(final Exception cause) {
        super(cause);
    }
}