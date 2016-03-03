/**
 * Created by Phani on 3/3/2016.
 */


if (Meteor.isClient) {
    /**
     Session keys.
     */
    SnapApp.SESSION_SELECTED_JNCTS = "selectedJnctIDs";

    /**
     * Default session variable values.
     */
    Session.setDefault(SnapApp.SESSION_SELECTED_JNCTS, []);
}