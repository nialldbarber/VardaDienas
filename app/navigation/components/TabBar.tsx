import type {BottomTabBarProps} from "@react-navigation/bottom-tabs";
import React from "react";
import {StyleSheet} from "react-native-unistyles";

import {Bar} from "@/app/navigation/components/Bar";
import {View} from "@/app/ui/components/View";

// Global state for scroll functions
let homeScrollToToday: (() => void) | null = null;
let favouritesScrollToTop: (() => void) | null = null;
let settingsScrollToTop: (() => void) | null = null;

// Functions to set the scroll handlers
export const setHomeScrollToToday = (fn: () => void) => {
	homeScrollToToday = fn;
};

export const setFavouritesScrollToTop = (fn: () => void) => {
	favouritesScrollToTop = fn;
};

export const setSettingsScrollToTop = (fn: () => void) => {
	settingsScrollToTop = fn;
};

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
					} else if (isFocused && !event.defaultPrevented) {
						// Handle scroll to top when tab is already focused
						if (route.name === "HomeStack" && homeScrollToToday) {
							// For home screen, scroll to today's date
							homeScrollToToday();
						} else if (route.name === "Favourites" && favouritesScrollToTop) {
							// For favourites screen, scroll to top
							favouritesScrollToTop();
						} else if (route.name === "Settings" && settingsScrollToTop) {
							// For settings screen, scroll to top
							settingsScrollToTop();
						}
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
