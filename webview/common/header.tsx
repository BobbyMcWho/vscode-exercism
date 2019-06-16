import { h } from "preact";
import { store } from "../utilities/store";

const Header = (props: { tabs: string[]; children: JSX.Element | JSX.Element[]; activeTab: number }) => {
  return (
    <header>
      <div class="top-section">{props.children}</div>
      <div class="bottom-section">
        {props.tabs.map((tab, i) => (
          <a
            href={"#" + tab}
            class={i === props.activeTab ? "nav-link active" : "nav-link"}
            onClick={() => store.setState({ currentTabIndex: i })}
          >
            {tab}
          </a>
        ))}
      </div>
    </header>
  );
};

export default Header;
