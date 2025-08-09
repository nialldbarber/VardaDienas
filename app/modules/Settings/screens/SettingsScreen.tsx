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
import {favourites$} from "@/app/store/favourites";
import {haptics$} from "@/app/store/haptics";
import {language$} from "@/app/store/language";
import {notifications$} from "@/app/store/notifications";
import {Header} from "@/app/ui/components/Header";
import {LanguageSelector} from "@/app/ui/components/LanguageSelector";
import {Layout} from "@/app/ui/components/layout";
import {Switch} from "@/app/ui/components/Switch";
import {Text} from "@/app/ui/components/Text";
import {TimePickerModal} from "@/app/ui/components/TimePickerModal";
import {View} from "@/app/ui/components/View";
import {WebViewScreen} from "@/app/ui/components/WebViewScreen";
import {colors} from "@/app/ui/config/colors";
import {haptics} from "@/app/utils/haptics";
import {
	cancelAllNotifications,
	cancelTestNotifications,
	checkScheduledNotificationContent,
	debugCheckMMKVStorage,
	debugNotificationIssue,
	debugScheduleForToday,
	debugShowAllScheduledNotifications,
	recoverFavouritesFromStorage,
	scheduleNameDayNotifications,
	simulateMultiplePushNotifications,
	simulatePushNotification,
	testDeepLink,
	testNotificationNavigation,
	testNotificationPermissions,
	testNotificationTextLogic,
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
	const hapticsEnabled = use$(haptics$.enabled);
	const notificationsEnabled = use$(language$.notifications);
	const notificationPermissionStatus = use$(
		language$.notificationPermissionStatus,
	);
	const notificationTime = use$(notifications$.notificationTime);

	const [webViewVisible, setWebViewVisible] = React.useState(false);
	const [webViewUrl, setWebViewUrl] = React.useState("");
	const [webViewTitle, setWebViewTitle] = React.useState("");
	const [showTimePicker, setShowTimePicker] = React.useState(false);

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
			language$.setNotificationPermissionStatus(status);

			if (status === Permissions.RESULTS.GRANTED) {
				console.log("Permission granted - keeping user preference");
			} else {
				console.log("Permission not granted - turning off notifications");
				language$.setNotifications(false);
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
		language$.setNotificationPermissionStatus(status);

		if (value) {
			if (status === Permissions.RESULTS.GRANTED) {
				language$.setNotifications(true);
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
					language$.setNotificationPermissionStatus(newStatus);

					if (newStatus === Permissions.RESULTS.GRANTED) {
						language$.setNotifications(true);
					} else {
						language$.setNotifications(false);
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
					language$.setNotifications(false);
				}
			} else {
				language$.setNotifications(false);
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
			language$.setNotifications(false);
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

	const handleSimulatePushNotification = async () => {
		try {
			await simulatePushNotification("Rūta", "31", "Jūlijs", 0);
			Toast.show({
				type: "success",
				text1: "Push notification simulation triggered",
				position: "bottom",
			});
		} catch (error) {
			console.error("Push notification simulation error:", error);
			Toast.show({
				type: "error",
				text1: "Push notification simulation failed",
				position: "bottom",
			});
		}
	};

	const handleSimulateMultiplePushNotifications = async () => {
		try {
			await simulateMultiplePushNotifications([
				{name: "Rūta", day: "31", month: "Jūlijs", daysBefore: 0},
				{name: "Angelika", day: "31", month: "Jūlijs", daysBefore: 0},
				{name: "Māris", day: "30", month: "Jūlijs", daysBefore: 1},
			]);
			Toast.show({
				type: "success",
				text1: "Multiple push notifications simulation triggered",
				position: "bottom",
			});
		} catch (error) {
			console.error("Multiple push notifications simulation error:", error);
			Toast.show({
				type: "error",
				text1: "Multiple push notifications simulation failed",
				position: "bottom",
			});
		}
	};

	const handleCancelTestNotifications = async () => {
		try {
			await cancelTestNotifications();
			Toast.show({
				type: "success",
				text1: "Test notifications cancelled",
				position: "bottom",
			});
		} catch (error) {
			console.error("Cancel test notifications error:", error);
			Toast.show({
				type: "error",
				text1: "Failed to cancel test notifications",
				position: "bottom",
			});
		}
	};

	const handleTestNotificationPermissions = async () => {
		try {
			await testNotificationPermissions();
			Toast.show({
				type: "success",
				text1: "Notification permissions test completed",
				text2: "Check console for details",
				position: "bottom",
			});
		} catch (error) {
			console.error("Notification permissions test error:", error);
			Toast.show({
				type: "error",
				text1: "Notification permissions test failed",
				position: "bottom",
			});
		}
	};

	const handleDebugScheduleForToday = async () => {
		try {
			const result = await debugScheduleForToday();
			Toast.show({
				type: result.success ? "success" : "error",
				text1: result.message,
				text2: result.details,
				position: "bottom",
			});
		} catch (error) {
			console.error("Debug schedule for today error:", error);
			Toast.show({
				type: "error",
				text1: "Debug schedule for today failed",
				position: "bottom",
			});
		}
	};

	const handleDebugShowAllScheduledNotifications = async () => {
		try {
			const result = await debugShowAllScheduledNotifications();
			Toast.show({
				type: result.success ? "success" : "error",
				text1: result.message,
				text2: result.details,
				position: "bottom",
			});
		} catch (error) {
			console.error("Debug show all scheduled notifications error:", error);
			Toast.show({
				type: "error",
				text1: "Debug show all scheduled notifications failed",
				position: "bottom",
			});
		}
	};

	const handleDebugCheckFavourites = () => {
		try {
			const favourites = favourites$.favourites.get();
			const count = favourites.length;

			Toast.show({
				type: "success",
				text1: `Favourites Debug: ${count} items`,
				text2:
					count > 0 ? `First: ${favourites[0]?.name}` : "No favourites found",
				position: "bottom",
			});
		} catch (error) {
			console.error("Debug check favourites error:", error);
			Toast.show({
				type: "error",
				text1: "Debug check favourites failed",
				position: "bottom",
			});
		}
	};

	const handleDebugCheckMMKVStorage = async () => {
		try {
			const result = await debugCheckMMKVStorage();
			Toast.show({
				type: result.success ? "success" : "error",
				text1: result.message,
				text2: result.details,
				position: "bottom",
			});
		} catch (error) {
			console.error("Debug MMKV storage error:", error);
			Toast.show({
				type: "error",
				text1: "Debug MMKV storage failed",
				position: "bottom",
			});
		}
	};

	const handleRecoverFavourites = async () => {
		try {
			const result = await recoverFavouritesFromStorage();
			Alert.alert(result.message, result.details);
		} catch (error) {
			console.error("Error recovering favourites:", error);
			Alert.alert("Error", "Failed to recover favourites");
		}
	};

	const handleTestNotificationTextLogic = () => {
		try {
			const result = testNotificationTextLogic();
			Alert.alert(result.message, result.details);
		} catch (error) {
			console.error("Error testing notification text logic:", error);
			Alert.alert("Error", "Failed to test notification text logic");
		}
	};

	const handleCheckScheduledNotificationContent = async () => {
		try {
			const result = await checkScheduledNotificationContent();
			Alert.alert(result.message, result.details);
		} catch (error) {
			console.error("Error checking scheduled notification content:", error);
			Alert.alert("Error", "Failed to check scheduled notification content");
		}
	};

	const handleDebugNotificationIssue = async () => {
		try {
			const result = await debugNotificationIssue();
			Alert.alert(result.message, result.details);
		} catch (error) {
			console.error("Error debugging notification issue:", error);
			Alert.alert("Error", "Failed to debug notification issue");
		}
	};

	const handleOpenTimePicker = () => {
		if (hapticsEnabled) {
			haptics.impactMedium();
		}
		setShowTimePicker(true);
	};

	const handleTimePickerConfirm = async (time: {
		hours: number;
		minutes: number;
	}) => {
		notifications$.setNotificationTime(time);
		Toast.show({
			type: "success",
			text1: t("settings.notificationTimeUpdated"),
			text2: `${time.hours.toString().padStart(2, "0")}:${time.minutes.toString().padStart(2, "0")}`,
			position: "bottom",
		});

		try {
			// Reschedule notifications for favourites that have reminders enabled
			const favourites = favourites$.favourites.get();
			const favouritesWithNotifications = favourites.filter(
				(fav) => fav.notifyMe,
			);

			if (favouritesWithNotifications.length > 0) {
				await cancelAllNotifications();
				for (const favourite of favouritesWithNotifications) {
					await scheduleNameDayNotifications(
						favourite.name,
						favourite.day,
						favourite.month,
						favourite.daysBefore && favourite.daysBefore.length > 0
							? favourite.daysBefore
							: [0],
					);
				}
			}
		} catch (error) {
			console.error(
				"Error rescheduling notifications after time change:",
				error,
			);
		}
	};

	const formatNotificationTime = () => {
		return `${notificationTime.hours.toString().padStart(2, "0")}:${notificationTime.minutes.toString().padStart(2, "0")}`;
	};

	const getCurrentLocalTime = () => {
		const now = new Date();
		return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
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
							value={hapticsEnabled.enabled}
							onValueChange={(value) => haptics$.setEnabled(value)}
						/>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{t("settings.notifications")}</Text>
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

					<Pressable style={styles.row} onPress={handleOpenTimePicker}>
						<View style={styles.rowContent}>
							<Text style={styles.rowText}>
								{t("settings.notificationTime")}
							</Text>
							<Text style={styles.rowSubtext}>
								{t("settings.notificationTimeDescription")}
							</Text>
						</View>
						<View style={styles.timeDisplay}>
							<Text style={styles.timeText}>{formatNotificationTime()}</Text>
							<ArrowRight2 size="20" color={colors.primary} />
						</View>
					</Pressable>

					{__DEV__ && (
						<View style={styles.row}>
							<View style={styles.rowContent}>
								<Text style={styles.rowText}>Debug: Current Time</Text>
								<Text style={styles.rowSubtext}>
									Local: {getCurrentLocalTime()} | Notification:{" "}
									{formatNotificationTime()}
								</Text>
							</View>
						</View>
					)}
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

				{__DEV__ && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>DEV - Debug</Text>
						<Pressable
							style={styles.row}
							onPress={handleSimulatePushNotification}
						>
							<Text style={styles.rowText}>
								Schedule Test Notification (1 min)
							</Text>
							<ArrowRight2 size="20" color={colors.primary} />
						</Pressable>

						<Pressable
							style={styles.row}
							onPress={handleSimulateMultiplePushNotifications}
						>
							<Text style={styles.rowText}>
								Schedule Multiple Test Notifications
							</Text>
							<ArrowRight2 size="20" color={colors.primary} />
						</Pressable>

						<Pressable
							style={styles.row}
							onPress={handleCancelTestNotifications}
						>
							<Text style={styles.rowText}>Cancel Test Notifications</Text>
							<ArrowRight2 size="20" color={colors.primary} />
						</Pressable>

						<Pressable
							style={styles.row}
							onPress={handleTestNotificationPermissions}
						>
							<Text style={styles.rowText}>Test Notification Permissions</Text>
							<ArrowRight2 size="20" color={colors.primary} />
						</Pressable>

						<Pressable style={styles.row} onPress={handleDebugScheduleForToday}>
							<Text style={styles.rowText}>Debug Schedule For Today</Text>
							<ArrowRight2 size="20" color={colors.primary} />
						</Pressable>

						<Pressable
							style={styles.row}
							onPress={handleDebugShowAllScheduledNotifications}
						>
							<Text style={styles.rowText}>
								Debug: Show All Scheduled Notifications
							</Text>
							<ArrowRight2 size="20" color={colors.primary} />
						</Pressable>

						<Pressable style={styles.row} onPress={handleDebugCheckFavourites}>
							<Text style={styles.rowText}>Debug: Check Favourites</Text>
							<ArrowRight2 size="20" color={colors.primary} />
						</Pressable>

						<Pressable style={styles.row} onPress={handleDebugCheckMMKVStorage}>
							<Text style={styles.rowText}>Debug: Check MMKV Storage</Text>
							<ArrowRight2 size="20" color={colors.primary} />
						</Pressable>

						<Pressable style={styles.row} onPress={handleRecoverFavourites}>
							<Text style={styles.rowText}>Recover Favourites</Text>
							<ArrowRight2 size="20" color={colors.primary} />
						</Pressable>

						<Pressable
							style={styles.row}
							onPress={handleTestNotificationTextLogic}
						>
							<Text style={styles.rowText}>Test Notification Text Logic</Text>
							<ArrowRight2 size="20" color={colors.primary} />
						</Pressable>

						<Pressable
							style={styles.row}
							onPress={handleCheckScheduledNotificationContent}
						>
							<Text style={styles.rowText}>
								Check Scheduled Notification Content
							</Text>
							<ArrowRight2 size="20" color={colors.primary} />
						</Pressable>

						<Pressable
							style={styles.row}
							onPress={handleDebugNotificationIssue}
						>
							<Text style={styles.rowText}>Debug Notification Issue</Text>
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
			<TimePickerModal
				visible={showTimePicker}
				onClose={() => setShowTimePicker(false)}
				onConfirm={handleTimePickerConfirm}
				title={t("settings.setNotificationTime")}
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
		fontWeight: "600",
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
	timeDisplay: {
		flexDirection: "row",
		alignItems: "center",
		gap: sizes["8px"],
	},
	timeText: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.primary,
	},
}));
