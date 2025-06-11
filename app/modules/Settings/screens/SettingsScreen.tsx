import {use$} from "@legendapp/state/react";
import {ExportCurve} from "iconsax-react-native";
import React from "react";
import {useTranslation} from "react-i18next";
import {Alert, Linking, Pressable} from "react-native";
import DeviceInfo from "react-native-device-info";
import * as Permissions from "react-native-permissions";
import Share from "react-native-share";
import {StyleSheet} from "react-native-unistyles";

import {settings$} from "@/app/store/settings";
import {Header} from "@/app/ui/components/Header";
import {LanguageSelector} from "@/app/ui/components/LanguageSelector";
import {Switch} from "@/app/ui/components/Switch";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {Layout} from "@/app/ui/components/layout";
import {colors} from "@/app/ui/config/colors";
import {haptics} from "@/app/utils/haptics";

export function SettingsScreen() {
	const {t} = useTranslation();
	const hapticsEnabled = use$(settings$.haptics);
	const notificationsEnabled = use$(settings$.notifications);
	const notificationPermissionStatus = use$(
		settings$.notificationPermissionStatus,
	);

	React.useEffect(() => {
		checkNotificationPermission();
	}, []);

	const checkNotificationPermission = async () => {
		try {
			const {status} = await Permissions.checkNotifications();
			settings$.notificationPermissionStatus.set(status);
		} catch (error) {
			console.error("Error checking notification permission:", error);
		}
	};

	const handleNotificationToggle = async (value: boolean) => {
		haptics.impactLight();

		if (value) {
			const currentStatus = settings$.notificationPermissionStatus.get();

			if (currentStatus === Permissions.RESULTS.GRANTED) {
				settings$.notifications.set(true);
			} else if (
				currentStatus === Permissions.RESULTS.DENIED ||
				currentStatus === "unavailable"
			) {
				try {
					const {status} = await Permissions.requestNotifications([
						"alert",
						"sound",
						"badge",
					]);
					settings$.notificationPermissionStatus.set(status);

					if (status === Permissions.RESULTS.GRANTED) {
						settings$.notifications.set(true);
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
					}
				} catch (error) {
					console.error("Error requesting notification permission:", error);
				}
			} else if (currentStatus === Permissions.RESULTS.BLOCKED) {
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
		const status = settings$.notificationPermissionStatus.get();
		const enabled = settings$.notifications.get();

		if (!enabled) return t("settings.notificationStatuses.disabled");

		switch (status) {
			case Permissions.RESULTS.GRANTED:
				return t("settings.notificationStatuses.enabled");
			case Permissions.RESULTS.DENIED:
				return t("settings.notificationStatuses.permissionNeeded");
			case Permissions.RESULTS.BLOCKED:
				return t("settings.notificationStatuses.blockedInSettings");
			case Permissions.RESULTS.LIMITED:
				return t("settings.notificationStatuses.limitedAccess");
			default:
				return t("settings.notificationStatuses.unknown");
		}
	};

	const handleShare = async () => {
		try {
			haptics.impactLight();
			await Share.open({
				message: "Check out this app",
				url: "https://www.google.com", // TODO: add app url
			});
		} catch (error) {
			console.error(error);
		}
	};

	const handleWriteReview = async () => {
		try {
			haptics.impactLight();
			const iosUrl =
				"itms-apps://itunes.apple.com/app/id[YOUR_APP_ID]?action=write-review";

			const supported = await Linking.canOpenURL(iosUrl);

			if (supported) {
				await Linking.openURL(iosUrl);
			} else {
				console.log("Cannot open app store");
			}
		} catch (error) {
			console.error("Error opening app store:", error);
		}
	};

	const handleContactUs = async () => {
		try {
			haptics.impactLight();
			const email = "support@vardadienas.com";
			const subject = "VardaDienas App - Contact";
			const body =
				"Hi there,\n\nI'm contacting you about the VardaDienas app.\n\n";

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
			haptics.impactLight();
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

	return (
		<Layout
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
					{/* <Pressable style={styles.row} onPress={handleWriteReview}>
						<Text style={styles.rowText}>{t("settings.writeReview")}</Text>
						<View style={styles.iconButton}>
							<Star1 size="20" color={colors.primary} variant="Bold" />
						</View>
					</Pressable>

					<Pressable style={styles.row} onPress={handleContactUs}>
						<Text style={styles.rowText}>{t("settings.contactUs")}</Text>
						<View style={styles.iconButton}>
							<Message size="20" color={colors.primary} variant="Bold" />
						</View>
					</Pressable>

					<Pressable style={styles.row} onPress={handleReportIssue}>
						<Text style={styles.rowText}>{t("settings.reportIssue")}</Text>
						<View style={styles.iconButton}>
							<Message size="20" color={colors.primary} variant="Bold" />
						</View>
					</Pressable> */}

					<Pressable style={styles.row} onPress={handleShare}>
						<Text style={styles.rowText}>{t("settings.shareWithFriends")}</Text>
						<View style={styles.iconButton}>
							<ExportCurve size="20" color={colors.primary} variant="Bold" />
						</View>
					</Pressable>
				</View>

				<View style={styles.versionContainer}>
					<Text style={styles.versionText}>
						{t("settings.version")} {DeviceInfo.getVersion()} (
						{DeviceInfo.getBuildNumber()})
					</Text>
				</View>
			</View>
		</Layout>
	);
}

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
		paddingVertical: sizes["20px"],
	},
	versionText: {
		fontSize: 12,
		color: tokens.text.fadedText,
		fontWeight: "400",
	},
}));
