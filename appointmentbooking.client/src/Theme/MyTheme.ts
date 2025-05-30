import { Theme, webLightTheme } from "@fluentui/react-components";

const MyTheme: Theme = {
  ...webLightTheme,

  // Brand Colors
  colorBrandBackground: "#006d77",
  colorBrandForeground1: "#006d77",
  colorBrandForeground2: "#ffffff",
  colorBrandForegroundLink: "#006d77",
  colorBrandBackgroundHover: "#005a66",
  colorBrandBackgroundPressed: "#004c57",
  colorBrandBackgroundSelected: "#005a66",

  // Search Bar Underline Color
  colorNeutralStrokeAccessible: "#006d77", // <-- This sets the underline color
  colorNeutralStrokeAccessibleHover: "#005a66",
  colorNeutralStrokeAccessiblePressed: "#004c57",

  // Accent
  colorPaletteDarkOrangeBackground1: "#eb2c5f",
  colorPaletteDarkOrangeForeground1: "#ffffff",

  // Background & Surface
  colorNeutralBackground1: "#f7f7f7",
  colorNeutralBackground2: "#ffffff",
  colorNeutralBackground3: "#e5e5e5",

  // Text & Borders
  colorNeutralForeground1: "#222222",
  colorNeutralForeground2: "#4f4f4f",
  colorNeutralForegroundDisabled: "#999999",
  colorNeutralStroke1: "#cccccc",

  // Success, Error, Warning
  colorPaletteGreenBackground3: "#d1fae5",
  colorPaletteRedBackground3: "#fee2e2",
  colorPaletteYellowBackground3: "#fef9c3",
  colorPaletteGreenForeground1: "#065f46",
  colorPaletteRedForeground1: "#991b1b",
  colorPaletteYellowForeground1: "#92400e",

  // Shadows
  shadow2: "0 2px 8px rgba(0, 0, 0, 0.1)",
  shadow4: "0 4px 12px rgba(0, 0, 0, 0.15)",
  shadow8: "0 8px 24px rgba(0, 0, 0, 0.2)",

  // Corners
  borderRadiusNone: "0px",
  borderRadiusSmall: "6px",
  borderRadiusMedium: "10px",
  borderRadiusLarge: "16px",

  // Font
  fontFamilyBase: `'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif`,
  fontSizeBase300: "14px",
  fontSizeBase400: "16px",
  fontSizeHero700: "24px",
  fontWeightRegular: 400,
  fontWeightSemibold: 600,
  fontWeightBold: 700,
};

export default MyTheme;
