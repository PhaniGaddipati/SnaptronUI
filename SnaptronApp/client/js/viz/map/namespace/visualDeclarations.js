/**
 * Created by Phani on 3/1/2016.
 */

/**
 * Session variables.
 */

Session.setDefault("selectedJnctIDs", []);

/**
 * Constants
 */
SnapApp.Map = {};

/**
 * Frame constants.
 * @type {number}
 */
SnapApp.Map.VIEWBOX_W = 1000;
SnapApp.Map.VIEWBOX_H = 350;
SnapApp.Map.MID_AXIS_Y_OFF = 4;
SnapApp.Map.AXIS_K_CUTOFF = 10000;

/**
 * Mouse marker constants.
 * @type {string}
 */
SnapApp.Map.MARKER_LABEL_STYLE = "fill:#EEEEEE;stroke:black;stroke-width:1";
SnapApp.Map.MARKER_LINE_STYLE = "stroke:#DDDDDD;stroke-width:1";
SnapApp.Map.MARKER_LABEL_HEIGHT = 25;

/**
 * Junction arc constants.
 * @type {number}
 */
SnapApp.Map.MIN_DISPLAY_LENGTH_PX = 3;
SnapApp.Map.JNCT_MAX_VAL_COLOR = "#d9230f";
SnapApp.Map.JNCT_NORMAL_COLOR = "black";
SnapApp.Map.JNCT_BOOL_TRUE_COLOR = "#d9230f";
SnapApp.Map.JNCT_HIGHLIGHT_COLOR = "#3a87ad";
SnapApp.Map.JNCT_SELECTED_COLOR = "#33BCFF";
SnapApp.Map.JNCT_NORMAL_WIDTH = 2;
SnapApp.Map.JNCT_HIGHLIGHTED_WIDTH = 4;
SnapApp.Map.JNCT_SELECTED_WIDTH = 5;

/**
 * Color scale constants.
 * @type {number}
 */
SnapApp.Map.SCALE_VIEWBOX_W = 100;
SnapApp.Map.SCALE_VIEWBOX_H = 15;
SnapApp.Map.SCALE_BAR_H = 3;
SnapApp.Map.SCALE_SEL_BAR_H = 4;
SnapApp.Map.SCALE_BAR_Y_OFF = 5;
SnapApp.Map.SCALE_TEXT_FONT_SIZE = 3;
SnapApp.Map.SCALE_TEXT_Y_OFF = 12;