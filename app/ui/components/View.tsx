import React from "react";
import type {ViewProps} from "react-native";

const NativeView: React.FC<ViewProps> = (props) =>
	React.createElement("RCTView", props);

interface Props extends ViewProps {}

export function View({children, ...rest}: Props) {
	return <NativeView {...rest}>{children}</NativeView>;
}
