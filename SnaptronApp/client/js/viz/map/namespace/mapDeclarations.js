/**
 * Created by Phani on 3/1/2016.
 */

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
SnapApp.Map.PADDING   = 20;
SnapApp.Map.DRAW_W    = SnapApp.Map.VIEWBOX_W - SnapApp.Map.PADDING * 2;
SnapApp.Map.DRAW_H    = SnapApp.Map.VIEWBOX_H - SnapApp.Map.PADDING * 2;

SnapApp.Map.AXIS_K_CUTOFF = 10000;

SnapApp.Map.DEFAULT_MID_AXIS_HEIGHT = 6;
SnapApp.Map.EXON_HEIGHT             = 20;
SnapApp.Map.EXON_STYLE              = "fill:#03A9F4;stroke:#03A9F4;stroke-width:2;fill-opacity:.25";
SnapApp.Map.CDS_MARKER_HEIGHT       = 3;
SnapApp.Map.CDS_MARKER_STYLE        = "fill:#8BC34A;";

/**
 * Mouse marker constants.
 * @type {string}
 */
SnapApp.Map.MARKER_LABEL_STYLE = "fill:#EEEEEE;stroke:black;stroke-width:1";
SnapApp.Map.MARKER_LINE_STYLE   = "stroke:#DDDDDD;stroke-width:1";
SnapApp.Map.MARKER_LABEL_HEIGHT = 25;

/**
 * Junction arc constants.
 * @type {number}
 */
SnapApp.Map.MAX_JNCTS_TO_DISPLAY = 1000;
SnapApp.Map.MIN_DISPLAY_LENGTH_PX  = 3;
SnapApp.Map.JNCT_MAX_VAL_COLOR     = "#d9230f";
SnapApp.Map.JNCT_NORMAL_COLOR      = "black";
SnapApp.Map.JNCT_BOOL_TRUE_COLOR   = "#d9230f";
SnapApp.Map.JNCT_HIGHLIGHT_COLOR   = "#3a87ad";
SnapApp.Map.JNCT_SELECTED_COLOR    = "#33BCFF";
SnapApp.Map.JNCT_NORMAL_WIDTH      = 4;
SnapApp.Map.JNCT_HIGHLIGHTED_WIDTH = 5;
SnapApp.Map.JNCT_SELECTED_WIDTH    = 6;

/**
 * Color scale constants.
 * @type {number}
 */
SnapApp.Map.SCALE_VIEWBOX_W = 100;
SnapApp.Map.SCALE_VIEWBOX_H      = 15;
SnapApp.Map.SCALE_BAR_H          = 3;
SnapApp.Map.SCALE_SEL_BAR_H      = 4;
SnapApp.Map.SCALE_BAR_Y_OFF      = 5;
SnapApp.Map.SCALE_TEXT_FONT_SIZE = 3;
SnapApp.Map.SCALE_TEXT_Y_OFF     = 12;