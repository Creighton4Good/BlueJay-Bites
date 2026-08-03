package bjbites.bjbites_springboot.config;

/**
 * Shared constants for event lifecycle behavior.
 */
public final class EventConstants {

    private EventConstants() {
    }

    /**
     * How long an event keeps showing in the active feed after its
     * availableUntil time passes, so the frontend can show a countdown
     * before it disappears. Both the active-events query and the scheduled
     * close job use this so the two stay consistent.
     */
    public static final long GRACE_PERIOD_MINUTES = 5;
}
