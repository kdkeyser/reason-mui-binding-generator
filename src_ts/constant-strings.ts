const ConstantStrings = [
  `
external toJsUnsafe : 'a => 'b = "%identity";

let unwrapValue =
  fun
    | \`String(s) => toJsUnsafe(s)
    | \`Bool(b) => toJsUnsafe(Js.Boolean.to_js_boolean(b))
    | \`Float(f) => toJsUnsafe(f)
    | \`Int(i) => toJsUnsafe(i)
    | \`Date(d) => toJsUnsafe(d)
    | \`Callback(c) => toJsUnsafe(c)
    | \`Element(e) => toJsUnsafe(e)
    | \`Object(_) => assert false
    | \`Enum(_) => assert false;

let optionMap = (fn, option) =>
  switch option {
  | Some(value) => Some(fn(value))
  | None => None
  };
`,
  `
module MuiTheme = {
  module Direction = {
    type t =
      | Ltr
      | Rtl;
    let toString = (direction: t) =>
      switch direction {
      | Ltr => "ltr"
      | Rtl => "rtl"
      };
    let fromString = (direction: string) =>
      switch direction {
      | "ltr" => Ltr
      | "rtl" => Rtl
      | other => raise(Failure("Unknown direction: " ++ other))
      };
  };
  module Spacing = {
    type t = {unit: int};
  };
  module Transitions = {
    module Easing = {
      type t = {
        easeInOut: string,
        easeOut: string,
        easeIn: string,
        sharp: string
      };
    };
    module Duration = {
      type t = {
        shortest: int,
        shorter: int,
        short: int,
        standard: int,
        complex: int,
        enteringScreen: int,
        leavingScreen: int
      };
    };
    type t = {
      easing: Easing.t,
      duration: Duration.t,
      getAutoHeightDuration: int => int,
      create: (string, {. "duration": int}) => string /* create: (string, {. "duration": int, "easing": string, "delay": int}) => string */
    };
  };
  [@bs.deriving jsConverter]
  type t = {
    direction: Direction.t,
    palette: unit,
    typography: unit,
    mixins: unit,
    breakpoints: unit,
    shadows: list(string),
    transitions: Transitions.t,
    spacing: Spacing.t,
    zIndex: int
  };
};
`,
  `
module WithStyles = {
  let component = ReasonReact.statelessComponent("WithStyles");
  let make = (~render, ~classes: Js.t({..}), _children) => {
    ...component,
    render: (_self) => render(classes)
  };
  type withStylesComponent('a) = [@bs] ('a => ReasonReact.reactClass);
  [@bs.module "material-ui/styles"]
  external withStylesExt : 'styles => withStylesComponent('component) =
    "withStyles";
  let creteStylesWrapper = (styles) => withStylesExt(styles);
  let make =
      (
        ~styles: option(Js.t({..}))=?,
        ~stylesWithTheme: option((MuiTheme.t => Js.t({..})))=?,
        ~render,
        children
      ) =>
    ReasonReact.wrapJsForReason(
      ~reactClass={
        let wrapper =
          creteStylesWrapper(
            switch styles {
            | Some(styles) => styles
            | None =>
              switch stylesWithTheme {
              | Some(stylesWithTheme) =>
                toJsUnsafe((theme) => stylesWithTheme(MuiTheme.tFromJs(theme)))
              | None => Js.Obj.empty()
              }
            }
          );
        [@bs]
        wrapper(
          ReasonReact.wrapReasonForJs(
            ~component,
            (jsProps) => make(~render=jsProps##render, ~classes=jsProps##classes, [||])
          )
        )
      },
      ~props={"render": render},
      children
    );
};
`
];

const constant = ConstantStrings.join('\n');

export default constant;