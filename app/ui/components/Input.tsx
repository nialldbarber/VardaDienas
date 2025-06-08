import React, {forwardRef, useEffect, useRef, useState} from "react";
import {
	Keyboard,
	Pressable,
	TextInput,
	type TextInputProps,
	type TextStyle,
	type ViewStyle,
} from "react-native";
import {StyleSheet} from "react-native-unistyles";

import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";

export interface InputProps extends Omit<TextInputProps, "style"> {
	label?: string;
	error?: string;
	helperText?: string;
	containerStyle?: ViewStyle;
	inputStyle?: TextStyle;
	labelStyle?: TextStyle;
	errorStyle?: TextStyle;
	helperTextStyle?: TextStyle;
	required?: boolean;
	dismissKeyboardOnTapOutside?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
	(
		{
			label,
			error,
			helperText,
			containerStyle,
			inputStyle,
			labelStyle,
			errorStyle,
			helperTextStyle,
			required = false,
			dismissKeyboardOnTapOutside = true,
			...rest
		},
		ref,
	) => {
		const hasError = Boolean(error);
		const [isFocused, setIsFocused] = useState(false);
		const inputRef = useRef<TextInput>(null);

		// Combine external ref with internal ref
		const setRef = (textInputRef: TextInput | null) => {
			inputRef.current = textInputRef;
			if (typeof ref === "function") {
				ref(textInputRef);
			} else if (ref) {
				ref.current = textInputRef;
			}
		};

		useEffect(() => {
			if (!dismissKeyboardOnTapOutside || !isFocused) return;

			const keyboardDidHideListener = Keyboard.addListener(
				"keyboardDidHide",
				() => {
					setIsFocused(false);
				},
			);

			return () => {
				keyboardDidHideListener.remove();
			};
		}, [isFocused, dismissKeyboardOnTapOutside]);

		const handleFocus = (
			e: Parameters<NonNullable<TextInputProps["onFocus"]>>[0],
		) => {
			setIsFocused(true);
			rest.onFocus?.(e);
		};

		const handleBlur = (
			e: Parameters<NonNullable<TextInputProps["onBlur"]>>[0],
		) => {
			setIsFocused(false);
			rest.onBlur?.(e);
		};

		const handlePressOutside = () => {
			if (dismissKeyboardOnTapOutside && isFocused) {
				Keyboard.dismiss();
				inputRef.current?.blur();

				console.log("dismissed keyboard");
			}

			console.log("did not work");
		};

		const inputContent = (
			<View style={[styles.container, containerStyle]}>
				{label && (
					<Text style={[styles.label, labelStyle]}>
						{label}
						{required && <Text style={styles.required}> *</Text>}
					</Text>
				)}
				<TextInput
					ref={setRef}
					style={[styles.input, hasError && styles.inputError, inputStyle]}
					placeholderTextColor="#999"
					onFocus={handleFocus}
					onBlur={handleBlur}
					{...rest}
				/>
				{error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
				{helperText && !error && (
					<Text style={[styles.helperText, helperTextStyle]}>{helperText}</Text>
				)}
			</View>
		);

		if (!dismissKeyboardOnTapOutside) {
			return inputContent;
		}

		return (
			<Pressable onPress={handlePressOutside} style={styles.pressableContainer}>
				{inputContent}
			</Pressable>
		);
	},
);

Input.displayName = "Input";

const styles = StyleSheet.create(({tokens, sizes}) => ({
	pressableContainer: {
		// This makes the pressable area extend beyond just the input
		paddingVertical: 10,
		paddingHorizontal: 5,
		marginVertical: -10,
		marginHorizontal: -5,
	},
	container: {
		marginBottom: sizes["16px"],
	},
	label: {
		fontSize: sizes["16px"],
		fontWeight: "500",
		marginBottom: sizes["8px"],
		color: tokens.text.primary,
	},
	required: {
		color: "#ef4444",
	},
	input: {
		borderWidth: 1,
		borderColor: "#d1d5db",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 16,
		backgroundColor: "#fff",
		color: "#333",
	},
	inputError: {
		borderColor: "#ef4444",
	},
	errorText: {
		fontSize: 12,
		color: "#ef4444",
		marginTop: 4,
	},
	helperText: {
		fontSize: 12,
		color: "#6b7280",
		marginTop: 4,
	},
}));
