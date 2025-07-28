import React from "react";
import {useTranslation} from "react-i18next";
import {Alert, TextInput} from "react-native";
import {StyleSheet} from "react-native-unistyles";

import {View} from "@/app/ui/components/View";
import {colors} from "@/app/ui/config/colors";

type Props = {
	value: number | undefined;
	onChange: (value: number | undefined) => void;
	onFocus?: () => void;
	onBlur?: () => void;
};

export function CustomReminderInput({value, onChange, onFocus, onBlur}: Props) {
	const {t} = useTranslation();

	const handleTextChange = (text: string) => {
		const numValue = Number.parseInt(text, 10);

		if (text === "") {
			onChange(undefined);
		} else if (!Number.isNaN(numValue) && numValue > 0 && numValue <= 7) {
			onChange(numValue);
		} else if (!Number.isNaN(numValue) && (numValue <= 0 || numValue > 7)) {
			Alert.alert(t("common.error"), "Please enter a number between 1 and 7", [
				{text: t("common.ok")},
			]);
		}
	};

	const handleFocus = () => {
		onFocus?.();
	};

	const handleBlur = () => {
		onBlur?.();
	};

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				value={value?.toString() || ""}
				onChangeText={handleTextChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				keyboardType="numeric"
				placeholder="0"
				placeholderTextColor={colors.grey}
				maxLength={1}
			/>
		</View>
	);
}

const styles = StyleSheet.create(({colors, sizes, tokens}) => ({
	container: {
		flexDirection: "row",
		alignItems: "center",
		gap: sizes["8px"],
	},
	input: {
		width: 60,
		height: 32,
		borderWidth: 1,
		borderColor: colors.lightGrey,
		borderRadius: 6,
		paddingHorizontal: sizes["8px"],
		fontSize: 14,
		textAlign: "center",
		backgroundColor: tokens.background.primary,
		color: tokens.text.primary,
	},
}));
