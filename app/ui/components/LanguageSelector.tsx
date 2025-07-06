import {use$} from "@legendapp/state/react";
import React from "react";
import {useTranslation} from "react-i18next";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import {StyleSheet} from "react-native-unistyles";

import {favourites$} from "@/app/store/favourites";
import {language$, type Language} from "@/app/store/language";
import {settings$} from "@/app/store/settings";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {colors} from "@/app/ui/config/colors";
import {haptics} from "@/app/utils/haptics";
import {
	cancelAllNotifications,
	scheduleNameDayNotifications,
} from "@/app/utils/notifications";

interface LanguageOption {
	code: Language;
	name: string;
}

export function LanguageSelector() {
	const {t} = useTranslation();
	const currentLanguage = use$(language$.currentLanguage);
	const hapticsEnabled = use$(settings$.haptics);

	const languages: LanguageOption[] = [
		{code: "en", name: t("settings.languages.en")},
		{code: "lv", name: t("settings.languages.lv")},
	];

	const handleLanguageChange = async (languageCode: Language) => {
		if (currentLanguage !== languageCode) {
			if (hapticsEnabled) {
				haptics.impactMedium();
			}

			// Change the language
			language$.setLanguage(languageCode);

			// Reschedule notifications with the new language
			try {
				// Cancel all existing notifications
				await cancelAllNotifications();

				// Get all favourites that have notifications enabled
				const favourites = favourites$.favourites.get();
				const favouritesWithNotifications = favourites.filter(
					(fav) => fav.notifyMe,
				);

				// Reschedule notifications for each favourite
				for (const favourite of favouritesWithNotifications) {
					await scheduleNameDayNotifications(
						favourite.name,
						favourite.day,
						favourite.month,
					);
				}

				console.log(
					`Rescheduled ${favouritesWithNotifications.length} notifications for language change to ${languageCode}`,
				);
			} catch (error) {
				console.error(
					"Error rescheduling notifications for language change:",
					error,
				);
			}
		}
	};

	return (
		<View style={styles.optionsContainer}>
			{languages.map((lang, index) => (
				<View
					key={lang.code}
					style={[
						styles.option,
						index === languages.length - 1 && styles.lastOption,
					]}
				>
					<Text style={styles.optionText}>{lang.name}</Text>
					<View>
						<BouncyCheckbox
							size={20}
							fillColor={colors.primary}
							hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
							unFillColor="transparent"
							useBuiltInState={false}
							iconStyle={{
								borderColor:
									currentLanguage === lang.code ? colors.primary : colors.grey,
								borderRadius: 10,
							}}
							innerIconStyle={{
								borderRadius: 10,
							}}
							textStyle={styles.optionText}
							isChecked={currentLanguage === lang.code}
							onPress={() => handleLanguageChange(lang.code)}
							bounceEffect={0.8}
							useNativeDriver
						/>
					</View>
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create(({colors, sizes, tokens}) => ({
	optionsContainer: {
		backgroundColor: tokens.background.row,
		marginHorizontal: sizes["16px"],
		borderRadius: sizes["8px"],
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.lightGrey,
		shadowColor: colors.black,
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
	option: {
		paddingVertical: sizes["16px"],
		paddingHorizontal: sizes["20px"],
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: colors.lightGrey,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	lastOption: {
		borderBottomWidth: 0,
	},
	optionText: {
		fontSize: 16,
		fontWeight: "500",
		color: tokens.text.primary,
		marginLeft: sizes["8px"],
	},
}));
