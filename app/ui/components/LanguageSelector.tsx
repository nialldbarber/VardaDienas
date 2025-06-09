import {use$} from "@legendapp/state/react";
import React from "react";
import {useTranslation} from "react-i18next";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import {StyleSheet} from "react-native-unistyles";

import {language$, type Language} from "@/app/store/language";
import {View} from "@/app/ui/components/View";
import {colors} from "@/app/ui/config/colors";
import {haptics} from "@/app/utils/haptics";
import {Text} from "./Text";

interface LanguageOption {
	code: Language;
	name: string;
}

export function LanguageSelector() {
	const {t} = useTranslation();
	const currentLanguage = use$(language$.currentLanguage);

	const languages: LanguageOption[] = [
		{code: "en", name: t("settings.languages.en")},
		{code: "lv", name: t("settings.languages.lv")},
	];

	const handleLanguageChange = (languageCode: Language) => {
		haptics.impactLight();
		language$.setLanguage(languageCode);
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
							// text={lang.name}
							iconStyle={{
								// width: 25,
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

const styles = StyleSheet.create(({colors, sizes}) => ({
	optionsContainer: {
		backgroundColor: colors.grey2,
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
		color: colors.black,
		marginLeft: sizes["8px"],
	},
}));
