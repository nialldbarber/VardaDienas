import {StyleSheet} from "react-native-unistyles";

import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";

type HeaderProps = {
	title: string;
};

export function Header({title}: HeaderProps) {
	return (
		<View style={styles.header}>
			<Text variant="header">{title}</Text>
		</View>
	);
}

const styles = StyleSheet.create(({sizes}) => ({
	header: {
		paddingHorizontal: sizes["10px"],
		height: 50,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
}));
