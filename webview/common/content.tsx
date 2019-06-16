import { h } from "preact";

const Content = (props: { tabs: JSX.Element[]; activeTab: number }) => {
  return <main>{props.tabs[props.activeTab]}</main>;
};

export default Content;
