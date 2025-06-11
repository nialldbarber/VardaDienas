import type {BottomTabBarProps} from "@react-navigation/bottom-tabs";
import {StyleSheet} from "react-native-unistyles";

import {Bar} from "@/app/navigation/components/Bar";
import {View} from "@/app/ui/components/View";

export function TabBar({state, descriptors, navigation}: BottomTabBarProps) {
	return (
		<View style={styles.bottomTabs}>
			{state.routes.map((route, index) => {
				const {options} = descriptors[route.key];
				const label =
					options.tabBarLabel !== undefined
						? options.tabBarLabel
						: options.title !== undefined
							? options.title
							: route.name;

				const isFocused = state.index === index;

				const onPress = () => {
					const event = navigation.emit({
						type: "tabPress",
						target: route.key,
						canPreventDefault: true,
					});

					if (!isFocused && !event.defaultPrevented) {
						navigation.navigate(route.name, route.params);
					}
				};

				const onLongPress = () => {
					navigation.emit({
						type: "tabLongPress",
						target: route.key,
					});
				};

				return (
					<Bar
						key={route.key}
						label={label}
						route={route}
						isFocused={isFocused}
						options={options}
						onPress={onPress}
						onLongPress={onLongPress}
					/>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create(({colors, sizes, tokens}, {insets}) => ({
	bottomTabs: {
		flexDirection: "row",
	},
	bottomTabContainer: {
		flex: 1,
		paddingTop: sizes["3px"],
		backgroundColor: tokens.background.primary,
		alignItems: "center",
		paddingBottom: insets.bottom,
	},
	bottomTabText: {
		color: tokens.text.primary,
		fontSize: 12,
		marginTop: sizes["3px"],
	},
}));
