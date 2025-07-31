import {use$} from "@legendapp/state/react";
import React from "react";
import {useTranslation} from "react-i18next";
import {
	Alert,
	AppState,
	Linking,
	Platform,
	Pressable,
	type ScrollView,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import {openComposer} from "react-native-email-link";
import * as Permissions from "react-native-permissions";
import Share from "react-native-share";
import Toast from "react-native-toast-message";
import {StyleSheet} from "react-native-unistyles";

import {setSettingsScrollToTop} from "@/app/navigation/components/TabBar";
import type {SettingsStackParamList} from "@/app/navigation/navigation";
import {settings$} from "@/app/store/settings";
import {Header} from "@/app/ui/components/Header";
import {LanguageSelector} from "@/app/ui/components/LanguageSelector";
import {Layout} from "@/app/ui/components/layout";
import {Switch} from "@/app/ui/components/Switch";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {WebViewScreen} from "@/app/ui/components/WebViewScreen";
import {colors} from "@/app/ui/config/colors";
import {haptics} from "@/app/utils/haptics";
import {
	testDeepLink,
	testNotificationNavigation,
} from "@/app/utils/notifications";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import type {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {ArrowRight2} from "iconsax-react-native";

type SettingsScreenRef = {
	scrollToTop: () => void;
};

export const SettingsScreen = React.forwardRef<SettingsScreenRef>((_, ref) => {
	const {t} = useTranslation();
	const navigation =
		useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
	const layoutRef = React.useRef<ScrollView>(null);
	const hapticsEnabled = use$(settings$.haptics);
	const notificationsEnabled = use$(settings$.notifications);
	const notificationPermissionStatus = use$(
		settings$.notificationPermissionStatus,
	);

	const [webViewVisible, setWebViewVisible] = React.useState(false);
	const [webViewUrl, setWebViewUrl] = React.useState("");
	const [webViewTitle, setWebViewTitle] = React.useState("");

	React.useImperativeHandle(ref, () => ({
		scrollToTop: () => {
			layoutRef.current?.scrollTo({y: 0, animated: true});
		},
	}));

	React.useEffect(() => {
		setSettingsScrollToTop(() => {
			layoutRef.current?.scrollTo({y: 0, animated: true});
		});
	}, []);

	React.useEffect(() => {
		checkNotificationPermission();
	}, []);

	useFocusEffect(
		React.useCallback(() => {
			console.log(
				"Settings screen focused - checking notification permissions",
			);
			checkNotificationPermission();
		}, []),
	);

	React.useEffect(() => {
		const handleAppStateChange = (nextAppState: string) => {
			console.log("App state changed to:", nextAppState);
			if (nextAppState === "active") {
				console.log("App became active - checking notification permissions");
				checkNotificationPermission();
			}
		};

		const subscription = AppState.addEventListener(
			"change",
			handleAppStateChange,
		);

		return () => {
			subscription?.remove();
		};
	}, []);

	const checkNotificationPermission = async () => {
		try {
			console.log("Checking notification permissions...");
			const {status} = await Permissions.checkNotifications();
			console.log("Current permission status:", status);
			settings$.notificationPermissionStatus.set(status);

			if (status === Permissions.RESULTS.GRANTED) {
				console.log("Permission granted - keeping user preference");
			} else {
				console.log("Permission not granted - turning off notifications");
				settings$.notifications.set(false);
			}
		} catch (error) {
			console.error("Error checking notification permission:", error);
		}
	};

	const handleNotificationToggle = async (value: boolean) => {
		if (hapticsEnabled) {
			haptics.impactMedium();
		}

		const {status} = await Permissions.checkNotifications();
		settings$.notificationPermissionStatus.set(status);

		if (value) {
			if (status === Permissions.RESULTS.GRANTED) {
				settings$.notifications.set(true);
			} else if (
				status === Permissions.RESULTS.DENIED ||
				status === "unavailable"
			) {
				try {
					const {status: newStatus} = await Permissions.requestNotifications([
						"alert",
						"sound",
						"badge",
					]);
					settings$.notificationPermissionStatus.set(newStatus);

					if (newStatus === Permissions.RESULTS.GRANTED) {
						settings$.notifications.set(true);
					} else {
						settings$.notifications.set(false);
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
					}
				} catch (error) {
					console.error("Error requesting notification permission:", error);
					settings$.notifications.set(false);
				}
			} else {
				settings$.notifications.set(false);
				Alert.alert(
					t("notifications.notificationsDisabled"),
					t("notifications.notificationsBlockedMessage"),
					[
						{text: t("common.cancel"), style: "cancel"},
						{
							text: t("notifications.openSettings"),
							onPress: () => Permissions.openSettings("notifications"),
						},
					],
				);
			}
		} else {
			settings$.notifications.set(false);
		}
	};

	const getNotificationStatusText = () => {
		console.log(
			"Getting notification status text for:",
			notificationPermissionStatus,
		);
		if (notificationPermissionStatus === Permissions.RESULTS.GRANTED) {
			return t("settings.notificationStatuses.enabled");
		}
		return t("settings.notificationStatuses.disabled");
	};

	const handleShare = async () => {
		try {
			if (hapticsEnabled) {
				haptics.impactMedium();
			}
			const appName = "Vārdu Kalendārs";
			const storeUrl = Platform.select({
				ios: "https://apps.apple.com/app/id123456789",
				android:
					"https://play.google.com/store/apps/details?id=com.vardadienas.app",
			});

			const message = t("settings.shareMessage", {appName, storeUrl});
			await Share.open({
				message,
			});
		} catch (error) {
			console.error("Error sharing:", error);
		}
	};

	const handleWriteReview = async () => {
		try {
			if (hapticsEnabled) {
				haptics.impactMedium();
			}
			const url = Platform.select({
				ios: "https://apps.apple.com/app/id123456789?action=write-review",
				android:
					"https://play.google.com/store/apps/details?id=com.vardadienas.app",
			});

			if (url) {
				const supported = await Linking.canOpenURL(url);
				if (supported) {
					await Linking.openURL(url);
				} else {
					console.log("Cannot open app store");
				}
			}
		} catch (error) {
			console.error("Error opening app store:", error);
		}
	};

	const handleContactUs = async () => {
		try {
			if (hapticsEnabled) {
				haptics.impactMedium();
			}
			const email = "support@vardadienas.com";
			const subject = "VardaDienas App - Contact";
			const body = `Hi there,

I'd like to get in touch about the Vārdu Kalendārs app.

Message:
[Your message here]

Thank you!`;

			const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
			const supported = await Linking.canOpenURL(url);

			if (supported) {
				await Linking.openURL(url);
			} else {
				console.log("Cannot open email client");
			}
		} catch (error) {
			console.error("Error opening email:", error);
		}
	};

	const handleReportIssue = async () => {
		try {
			if (hapticsEnabled) {
				haptics.impactMedium();
			}
			const email = "support@vardadienas.com";
			const subject = "VardaDienas App - Issue Report";
			const appVersion = DeviceInfo.getVersion();
			const buildNumber = DeviceInfo.getBuildNumber();
			const systemVersion = DeviceInfo.getSystemVersion();
			const deviceModel = DeviceInfo.getModel();

			const body = `Hi there,

I'm reporting an issue with the Vārdu Kalendārs app.

Issue Description:
[Please describe the issue here]

Device Information:
- App Version: ${appVersion} (${buildNumber})
- Device: ${deviceModel}
- OS Version: ${systemVersion}

Steps to Reproduce:
1. 
2. 
3. 

Expected Behavior:
[What should have happened]

Actual Behavior:
[What actually happened]

Thank you!`;

			const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
			const supported = await Linking.canOpenURL(url);

			if (supported) {
				await Linking.openURL(url);
			} else {
				console.log("Cannot open email client");
			}
		} catch (error) {
			console.error("Error opening email:", error);
		}
	};

	const handleSupport = () => {
		if (hapticsEnabled) {
			haptics.impactMedium();
		}
		setWebViewUrl(
			"https://rumbling-print-6e4.notion.site/V-rdu-Kalend-rs-Support-23ef0ce6e72280738a66c8751caf44ce?pvs=74",
		);
		setWebViewTitle(t("settings.support"));
		setWebViewVisible(true);
	};

	const handlePrivacyPolicy = () => {
		if (hapticsEnabled) {
			haptics.impactMedium();
		}
		setWebViewUrl(
			"https://rumbling-print-6e4.notion.site/V-rdu-Kalend-rs-Privacy-Policy-23ef0ce6e722808baed7e3d41d0191c1?pvs=74",
		);
		setWebViewTitle(t("settings.privacyPolicy"));
		setWebViewVisible(true);
	};

	const handleGiveFeedback = async () => {
		try {
			if (hapticsEnabled) {
				haptics.impactMedium();
			}

			const appVersion = DeviceInfo.getVersion();
			const buildNumber = DeviceInfo.getBuildNumber();

			const subject = "VardaDienas App - Feedback";
			const body = `Feedback for app version ${appVersion} (${buildNumber}):

[Your feedback here]

Thank you for your feedback!`;

			await openComposer({
				to: "nialldbarber@gmail.com",
				subject: subject,
				body: body,
			});
		} catch (error) {
			console.error("Error opening email:", error);
		}
	};

	const handleCloseWebView = () => {
		setWebViewVisible(false);
	};

	const handleTestDeepLink = async () => {
		try {
			await testDeepLink("vardadienas://favourites?name=Test%20Name");
			Toast.show({
				type: "success",
				text1: "Deep link test triggered",
				position: "bottom",
			});
		} catch (error) {
			console.error("Deep link test error:", error);
			Toast.show({
				type: "error",
				text1: "Deep link test failed",
				position: "bottom",
			});
		}
	};

	const handleTestNotificationNavigation = async () => {
		try {
			await testNotificationNavigation("Test Name");
			Toast.show({
				type: "success",
				text1: "Notification navigation test triggered",
				position: "bottom",
			});
		} catch (error) {
			console.error("Notification navigation test error:", error);
			Toast.show({
				type: "error",
				text1: "Notification navigation test failed",
				position: "bottom",
			});
		}
	};

	return (
		<Layout
			ref={layoutRef}
			header={<Header title={t("settings.title")} />}
			withScroll="vertical"
		>
			<View style={styles.container}>
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{t("settings.general")}</Text>
					<LanguageSelector />
					<View style={{height: 8}} />
					<View style={styles.row}>
						<View style={styles.rowContent}>
							<Text style={styles.rowText}>{t("settings.haptics")}</Text>
							<Text style={styles.rowSubtext}>
								{hapticsEnabled ? t("haptics.enabled") : t("haptics.disabled")}
							</Text>
						</View>
						<Switch
							value={hapticsEnabled}
							onValueChange={(value) => settings$.haptics.set(value)}
						/>
					</View>

					<View style={styles.row}>
						<View style={styles.rowContent}>
							<Text style={styles.rowText}>{t("settings.notifications")}</Text>
							<Text style={styles.rowSubtext}>
								{getNotificationStatusText()}
							</Text>
						</View>
						<Switch
							value={notificationsEnabled}
							onValueChange={handleNotificationToggle}
						/>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{t("settings.support")}</Text>
					<Pressable style={styles.row} onPress={handleSupport}>
						<Text style={styles.rowText}>{t("settings.support")}</Text>
						<ArrowRight2 size="20" color={colors.primary} />
					</Pressable>

					<Pressable style={styles.row} onPress={handleGiveFeedback}>
						<Text style={styles.rowText}>{t("settings.giveFeedback")}</Text>
						<ArrowRight2 size="20" color={colors.primary} />
					</Pressable>

					<Pressable style={styles.row} onPress={handlePrivacyPolicy}>
						<Text style={styles.rowText}>{t("settings.privacyPolicy")}</Text>
						<ArrowRight2 size="20" color={colors.primary} />
					</Pressable>
				</View>

				{/* Debug section - only show in development */}
				{__DEV__ && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Debug</Text>
						<Pressable style={styles.row} onPress={handleTestDeepLink}>
							<Text style={styles.rowText}>Test Deep Link</Text>
							<ArrowRight2 size="20" color={colors.primary} />
						</Pressable>

						<Pressable
							style={styles.row}
							onPress={handleTestNotificationNavigation}
						>
							<Text style={styles.rowText}>Test Notification Navigation</Text>
							<ArrowRight2 size="20" color={colors.primary} />
						</Pressable>
					</View>
				)}

				<View style={styles.madeWith}>
					<Text style={styles.madeWithText} withEmoji>
						{t("settings.madeWith")}
					</Text>
				</View>

				<View style={styles.versionContainer}>
					<Text style={styles.versionText}>
						{t("settings.version")} {DeviceInfo.getVersion()} (
						{DeviceInfo.getBuildNumber()})
					</Text>
				</View>
			</View>
			<WebViewScreen
				visible={webViewVisible}
				url={webViewUrl}
				title={webViewTitle}
				onClose={handleCloseWebView}
			/>
		</Layout>
	);
});

const styles = StyleSheet.create(({colors, sizes, tokens}) => ({
	container: {
		flex: 1,
		paddingVertical: sizes["16px"],
	},
	section: {
		marginBottom: sizes["24px"],
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: colors.grey,
		marginBottom: sizes["8px"],
		marginHorizontal: sizes["20px"],
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: tokens.background.row,
		marginHorizontal: sizes["16px"],
		paddingVertical: sizes["16px"],
		paddingHorizontal: sizes["20px"],
		borderRadius: sizes["8px"],
		marginBottom: sizes["8px"],
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
	rowContent: {
		flex: 1,
	},
	rowText: {
		fontSize: 16,
		fontWeight: "500",
		color: tokens.text.primary,
	},
	rowSubtext: {
		fontSize: 12,
		color: colors.grey,
		marginTop: sizes["2px"],
	},
	iconButton: {
		padding: sizes["8px"],
		borderRadius: 100,
		backgroundColor: tokens.background.row,
	},
	versionContainer: {
		alignItems: "center",
		marginTop: "auto",
		paddingTop: sizes["10px"],
	},
	versionText: {
		fontSize: 12,
		color: tokens.text.fadedText,
		fontWeight: "400",
	},
	madeWith: {
		alignItems: "center",
		marginTop: "auto",
		paddingTop: sizes["20px"],
	},
	madeWithText: {
		fontSize: 12,
		color: colors.grey,
		fontWeight: "400",
	},
}));
