import {useTranslation} from "react-i18next";
import {Alert, Pressable} from "react-native";
import Toast from "react-native-toast-message";
import {StyleSheet} from "react-native-unistyles";

import {favourites$} from "@/app/store/favourites";
import {haptics$} from "@/app/store/haptics";
import type {DayData} from "@/app/types";
import {Checkbox} from "@/app/ui/components/Checkbox";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {hapticToTrigger} from "@/app/utils/haptics";
import {
	requestNotificationPermissions,
	scheduleNameDayNotifications,
} from "@/app/utils/notifications";
import {use$} from "@legendapp/state/react";
import React from "react";
import * as Permissions from "react-native-permissions";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

type Props = {
	vards: string;
	isChecked: boolean;
	data: DayData;
	month: string | null;
	isLast: boolean;
	isHighlighted?: boolean;
};

export function CheckboxRow({
	vards,
	isChecked,
	data,
	month,
	isLast,
	isHighlighted = false,
}: Props) {
	const {t} = useTranslation();
	const haptic = hapticToTrigger("impactMedium");
	const hapticsEnabled = use$(haptics$.enabled);

	const borderOpacity = useSharedValue(0);

	React.useEffect(() => {
		if (isHighlighted) {
			borderOpacity.value = withTiming(0.2, {duration: 300});
			const timer = setTimeout(() => {
				borderOpacity.value = withTiming(0, {duration: 300});
			}, 3000);

			return () => clearTimeout(timer);
		}
	}, [isHighlighted, borderOpacity]);

	const highlightStyle = useAnimatedStyle(() => ({
		backgroundColor: `rgba(164, 52, 58, ${borderOpacity.value})`,
	}));

	const handleCheckedChange = async () => {
		favourites$.addFavourite({
			name: vards,
			day: data.diena,
			month: month ?? "",
		});

		try {
			const hasPermission = await requestNotificationPermissions();
			if (hasPermission) {
				await scheduleNameDayNotifications(vards, data.diena, month ?? "");
				favourites$.toggleNotification(vards, true);

				Toast.show({
					type: "success",
					text1: t("toast.addedWithReminder", {name: vards}),
					position: "bottom",
				});
			} else {
				Alert.alert(
					t("notifications.permissionRequired"),
					t("notifications.permissionMessage"),
					[
						{text: t("common.cancel"), style: "cancel"},
						{
							text: t("notifications.openSettings"),
							onPress: () => Permissions.openSettings("notifications"),
						},
					],
				);
				Toast.show({
					type: "success",
					text1: t("toast.added", {name: vards}),
					position: "bottom",
				});
			}
		} catch (error) {
			console.error("Error setting up notification:", error);
			Toast.show({
				type: "success",
				text1: t("toast.added", {name: vards}),
				position: "bottom",
			});
		}
	};

	const handleUnCheckedChange = () => {
		favourites$.removeFavourite(vards);
		Toast.show({
			type: "info",
			text1: t("toast.removed", {name: vards}),
			position: "bottom",
		});
	};

	const handleRowPress = () => {
		if (hapticsEnabled) {
			haptic.impactMedium();
		}

		if (isChecked) {
			handleUnCheckedChange();
		} else {
			handleCheckedChange();
		}
	};

	return (
		<View style={styles.container(isLast)}>
			<Animated.View style={[styles.pressableContent, highlightStyle]}>
				<Pressable onPress={handleRowPress} style={styles.pressableInner}>
					<View style={styles.nameContainer}>
						<Text style={styles.text}>{vards}</Text>
					</View>
					<View>
						<Checkbox
							checked={isChecked}
							onCheckedChange={handleCheckedChange}
							onUnCheckedChange={handleUnCheckedChange}
						/>
					</View>
				</Pressable>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create(({sizes, colors, tokens}) => ({
	container: (isLast: boolean) => ({
		paddingTop: sizes["10px"],
		paddingBottom: sizes["10px"],
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		flex: 1,
		borderBottomColor: isLast ? "transparent" : colors.grey3,
		borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
	}),
	pressableContent: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		flex: 1,
		paddingHorizontal: sizes["12px"],
		paddingVertical: sizes["8px"],
		borderRadius: 8,
	},
	pressableInner: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		flex: 1,
	},
	nameContainer: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	text: {
		color: tokens.text.primary,
		fontWeight: "600",
	},
	starIcon: {
		marginRight: sizes["8px"],
	},
}));
