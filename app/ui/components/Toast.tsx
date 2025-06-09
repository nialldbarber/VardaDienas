import type {ToastConfig} from "react-native-toast-message";
import ToastMessage, {BaseToast, ErrorToast} from "react-native-toast-message";
import {StyleSheet} from "react-native-unistyles";

const toastConfig: ToastConfig = {
	success: (props) => (
		<BaseToast
			{...props}
			style={[styles.container, styles.success]}
			contentContainerStyle={styles.contentContainer}
			text1Style={styles.text1Success}
			text2Style={styles.text2Success}
		/>
	),
	error: (props) => (
		<ErrorToast
			{...props}
			style={[styles.container, styles.error]}
			contentContainerStyle={styles.contentContainer}
			text1Style={styles.text1}
			text2Style={styles.text2}
		/>
	),
	info: (props) => (
		<BaseToast
			{...props}
			style={[styles.container, styles.info]}
			contentContainerStyle={styles.contentContainer}
			text1Style={styles.text1}
			text2Style={styles.text2}
		/>
	),
};

export function Toast() {
	return <ToastMessage config={toastConfig} />;
}

const styles = StyleSheet.create(({colors}) => ({
	container: {
		width: "90%",
		height: 70,
		borderRadius: 12,
		borderLeftWidth: 0,
		paddingHorizontal: 0,
		paddingVertical: 0,
		marginHorizontal: 16,
		marginTop: 10,
	},
	contentContainer: {
		paddingHorizontal: 20,
		paddingVertical: 12,
		flex: 1,
	},
	text1: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.white,
		marginBottom: 2,
		textAlign: "center",
	},
	text1Success: {
		color: colors.black,
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 2,
		textAlign: "center",
	},
	text2: {
		fontSize: 14,
		fontWeight: "400",
		color: colors.white,
		opacity: 0.9,
		textAlign: "center",
	},
	text2Success: {
		color: colors.black,
		fontSize: 14,
		fontWeight: "400",
		opacity: 0.9,
		textAlign: "center",
	},
	success: {
		backgroundColor: colors.success,
	},
	error: {
		backgroundColor: colors.error,
	},
	info: {
		backgroundColor: colors.info,
	},
}));
