import React from "react";
import {useTranslation} from "react-i18next";
import {
	ActivityIndicator,
	Modal,
	Pressable,
	StyleSheet,
	Text,
} from "react-native";
import {WebView} from "react-native-webview";

import {View} from "@/app/ui/components/View";
import {colors} from "@/app/ui/config/colors";

type WebViewScreenProps = {
	url: string;
	title: string;
	visible: boolean;
	onClose: () => void;
};

export const WebViewScreen = ({
	url,
	title,
	visible,
	onClose,
}: WebViewScreenProps) => {
	const {t} = useTranslation();
	const [loading, setLoading] = React.useState(true);

	const handleLoadEnd = () => {
		setLoading(false);
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
			onRequestClose={onClose}
		>
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.title}>{title}</Text>
					<Pressable style={styles.closeButton} onPress={onClose}>
						<Text style={styles.closeText}>✕</Text>
					</Pressable>
				</View>
				<WebView
					source={{uri: url}}
					style={styles.webview}
					onLoadEnd={handleLoadEnd}
					startInLoadingState={true}
					renderLoading={() => (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="large" color={colors.primary} />
						</View>
					)}
				/>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.lightGrey,
		backgroundColor: "white",
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
		color: colors.primary,
		flex: 1,
	},
	closeButton: {
		padding: 8,
	},
	closeText: {
		fontSize: 20,
		fontWeight: "600",
		color: colors.primary,
	},
	webview: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
