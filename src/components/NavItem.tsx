import React from "react";
import { ViewType } from "../interfaces/ViewTypes";

type NavItemProps = {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  view?: ViewType;
  activeView?: ViewType;
};

const NavItem: React.FC<NavItemProps> = (props) => {
  const { icon: Icon, label, onClick } = props;

  // Determine if item is active based on the provided props
  const isActive =
    ("active" in props && props.active === true) ||
    ("view" in props &&
      "activeView" in props &&
      props.view === props.activeView);

  return (
    <button
      className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
        isActive
          ? "bg-slate-800/70 text-cyan-400"
          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/30"
      }`}
      onClick={onClick}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </button>
  );
};

export default NavItem;
