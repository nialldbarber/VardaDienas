import {useTranslation} from "react-i18next";
import {Pressable} from "react-native";
import Toast from "react-native-toast-message";
import {StyleSheet} from "react-native-unistyles";

import {favourites$} from "@/app/store/favourites";
import {settings$} from "@/app/store/settings";
import type {DayData} from "@/app/types";
import {Checkbox} from "@/app/ui/components/Checkbox";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {scheduleNameDayNotifications} from "@/app/utils/notifications";
import {use$} from "@legendapp/state/react";
import notifee from "@notifee/react-native";

type Props = {
	vards: string;
	isChecked: boolean;
	data: DayData;
	month: string | null;
	isLast: boolean;
};

export function CheckboxRow({vards, isChecked, data, month, isLast}: Props) {
	const {t} = useTranslation();
	const globalNotificationsEnabled = use$(settings$.notifications);

	const handleCheckedChange = async () => {
		console.log("=== FAVORITE ADDED ===");
		console.log("Global notifications enabled:", globalNotificationsEnabled);

		// Add to favourites first
		favourites$.addFavourite({
			name: vards,
			day: data.diena,
			month: month ?? "",
		});

		// Always try to enable notifications when favoriting (for testing)
		try {
			console.log("Attempting to enable notifications for:", vards);

			// Use notifee directly to ensure native permission dialog appears
			const settings = await notifee.requestPermission();
			const hasPermission = settings.authorizationStatus >= 1;
			console.log(
				"Permission result:",
				hasPermission,
				"Status:",
				settings.authorizationStatus,
			);

			if (hasPermission) {
				console.log("Scheduling notification for:", vards);
				await scheduleNameDayNotifications(vards, data.diena, month ?? "");
				// Update the favourite to have notifications enabled
				favourites$.toggleNotification(vards, true);

				Toast.show({
					type: "success",
					text1: t("toast.addedWithReminder", {name: vards}),
					position: "bottom",
				});
			} else {
				console.log("Permission denied for notifications");
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
		if (isChecked) {
			handleUnCheckedChange();
		} else {
			handleCheckedChange();
		}
	};

	return (
		<Pressable onPress={handleRowPress} style={styles.container(isLast)}>
			<Text style={styles.text}>{vards}</Text>
			<View>
				<Checkbox
					checked={isChecked}
					onCheckedChange={handleCheckedChange}
					onUnCheckedChange={handleUnCheckedChange}
				/>
			</View>
		</Pressable>
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
	text: {
		color: tokens.text.primary,
	},
}));
