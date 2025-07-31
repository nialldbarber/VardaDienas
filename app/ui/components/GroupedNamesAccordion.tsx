import {Accordion} from "@animatereactnative/accordion";
import {useFocusEffect} from "@react-navigation/native";
import {ArrowDown2, Star1} from "iconsax-react-native";
import React from "react";
import {useTranslation} from "react-i18next";
import {Alert, AppState, Pressable} from "react-native";
import * as Permissions from "react-native-permissions";
import {StyleSheet} from "react-native-unistyles";

import type {Favourite} from "@/app/store/favourites";
import {favourites$} from "@/app/store/favourites";
import {settings$} from "@/app/store/settings";
import {Button} from "@/app/ui/components/Button";
import {Checkbox} from "@/app/ui/components/Checkbox";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {isTodayNameDay} from "@/app/utils/dates";
import {haptics} from "@/app/utils/haptics";
import {
	cancelNameDayNotifications,
	checkNotificationPermissions,
	debugNotificationSetup,
	scheduleNameDayNotifications,
} from "@/app/utils/notifications";
import {use$} from "@legendapp/state/react";
import Share from "react-native-share";
import Toast from "react-native-toast-message";
import {colors} from "../config/colors";

type NamesByDay = {
	day: string;
	names: string[];
	favourites: Favourite[];
};

type NamesByMonth = {
	month: string;
	days: NamesByDay[];
};

type Props = {
	favourites: Favourite[];
	highlightName?: string;
};

const MONTH_ORDER = [
	"Janvāris",
	"Februāris",
	"Marts",
	"Aprīlis",
	"Maijs",
	"Jūnijs",
	"Jūlijs",
	"Augusts",
	"Septembris",
	"Oktobris",
	"Novembris",
	"Decembris",
];

function groupFavouritesByMonthAndDay(favourites: Favourite[]): NamesByMonth[] {
	const grouped: Record<string, Record<string, Favourite[]>> = {};

	for (const favourite of favourites) {
		if (!grouped[favourite.month]) {
			grouped[favourite.month] = {};
		}
		if (!grouped[favourite.month][favourite.day]) {
			grouped[favourite.month][favourite.day] = [];
		}
		grouped[favourite.month][favourite.day].push(favourite);
	}

	return Object.entries(grouped)
		.map(([month, days]) => ({
			month,
			days: Object.entries(days)
				.map(([day, favourites]) => ({
					day,
					names: favourites.map((f) => f.name),
					favourites: favourites,
				}))
				.sort((a, b) => Number.parseInt(a.day) - Number.parseInt(b.day)), // Sort days numerically
		}))
		.sort((a, b) => {
			const aIndex = MONTH_ORDER.indexOf(a.month);
			const bIndex = MONTH_ORDER.indexOf(b.month);
			return aIndex - bIndex;
		});
}

export const GroupedNamesAccordion = ({favourites, highlightName}: Props) => {
	const {t} = useTranslation();
	// Use reactive state directly instead of props to ensure UI updates
	const reactiveFavourites = use$(favourites$.favourites);
	const hapticsEnabled = use$(settings$.haptics);

	// State to track which accordions should be auto-opened
	const [autoOpenAccordions, setAutoOpenAccordions] = React.useState<
		Set<string>
	>(new Set());

	// Create grouped data from reactive favourites
	const groupedData = React.useMemo(() => {
		return groupFavouritesByMonthAndDay(reactiveFavourites);
	}, [reactiveFavourites]);

	// Find favourites whose name day is today
	const todaysFavourites = React.useMemo(() => {
		return reactiveFavourites.filter((favourite) =>
			isTodayNameDay(favourite.day, favourite.month),
		);
	}, [reactiveFavourites]);

	// Auto-open accordions for today's name days when screen comes into focus
	useFocusEffect(
		React.useCallback(() => {
			const handleAppStateChange = (nextAppState: string) => {
				if (nextAppState === "active") {
					// Small delay to ensure the component is fully rendered
					setTimeout(() => {
						const accordionKeys = todaysFavourites.map(
							(favourite) => `${favourite.name}-0`,
						);
						setAutoOpenAccordions(new Set(accordionKeys));

						// Clear auto-open state after 3 seconds to allow normal user interaction
						setTimeout(() => {
							setAutoOpenAccordions(new Set());
						}, 3000);
					}, 100);
				}
			};

			// Auto-open accordions when screen comes into focus
			setTimeout(() => {
				const accordionKeys = todaysFavourites.map(
					(favourite) => `${favourite.name}-0`,
				);
				setAutoOpenAccordions(new Set(accordionKeys));

				// Clear auto-open state after 3 seconds to allow normal user interaction
				setTimeout(() => {
					setAutoOpenAccordions(new Set());
				}, 3000);
			}, 100);

			// Listen for app state changes
			const subscription = AppState.addEventListener(
				"change",
				handleAppStateChange,
			);

			return () => {
				subscription?.remove();
			};
		}, [todaysFavourites]),
	);

	// Check if a favourite should be highlighted
	const shouldHighlight = React.useCallback(
		(name: string) => {
			return (
				highlightName && name.toLowerCase() === highlightName.toLowerCase()
			);
		},
		[highlightName],
	);

	const handleAccordionChange = (
		isOpen: boolean,
		favouriteName?: string,
		index?: number,
	) => {
		if (hapticsEnabled) {
			haptics.impactMedium();
		}

		// Remove from auto-open set when user manually closes an accordion
		if (!isOpen && favouriteName && index !== undefined) {
			setAutoOpenAccordions((prev) => {
				const newSet = new Set(prev);
				newSet.delete(`${favouriteName}-${index}`);
				return newSet;
			});
		}
	};

	const handleNotificationToggle = async (
		favourite: Favourite,
		enabled: boolean,
	) => {
		try {
			if (enabled) {
				const hasPermission = await checkNotificationPermissions();

				if (!hasPermission) {
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
					return;
				}

				await debugNotificationSetup(
					favourite.name,
					favourite.day,
					favourite.month,
				);

				await scheduleNameDayNotifications(
					favourite.name,
					favourite.day,
					favourite.month,
					[0],
				);

				Toast.show({
					type: "success",
					text1: t("notifications.notificationScheduled"),
					text2: t("notifications.reminderSet", {name: favourite.name}),
					position: "bottom",
				});
			} else {
				await cancelNameDayNotifications(
					favourite.name,
					favourite.day,
					favourite.month,
				);

				Toast.show({
					type: "info",
					text1: t("notifications.notificationCancelled"),
					text2: t("notifications.reminderRemoved", {name: favourite.name}),
					position: "bottom",
				});
			}

			favourites$.toggleNotification(favourite.name, enabled);
		} catch (error) {
			console.error("Error toggling notification:", error);
			Toast.show({
				type: "error",
				text1: t("common.error"),
				text2: t("notifications.updateSettingsError"),
				position: "bottom",
			});
		}
	};

	const handleRemoveFavourite = (name: string) => {
		favourites$.removeFavourite(name);
	};

	const handleShareWishes = async (name: string) => {
		try {
			if (hapticsEnabled) {
				haptics.impactMedium();
			}

			const message = t("favourites.shareMessage", {name});
			await Share.open({
				message,
			});
		} catch (error) {
			console.error("Error sharing wishes:", error);
		}
	};

	const handleDaysBeforeToggle = async (favourite: Favourite, day: number) => {
		haptics.impactMedium();
		try {
			const wasSelected = favourite.daysBefore?.includes(day) || false;
			console.log(
				`Toggling day ${day} for ${favourite.name}, was selected: ${wasSelected}`,
			);

			const isNowSelected = !wasSelected;

			if (isNowSelected) {
				const hasPermission = await checkNotificationPermissions();

				if (!hasPermission) {
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
					return;
				}
			}

			favourites$.toggleDaysBefore(favourite.name, day);

			await cancelNameDayNotifications(
				favourite.name,
				favourite.day,
				favourite.month,
			);

			console.log(
				"After toggle - wasSelected:",
				wasSelected,
				"isNowSelected:",
				isNowSelected,
			);

			if (isNowSelected) {
				const updatedFavourite = reactiveFavourites.find(
					(f) => f.name === favourite.name,
				);
				console.log(
					"Scheduling notifications for days:",
					updatedFavourite?.daysBefore,
				);
				if (
					updatedFavourite?.daysBefore &&
					updatedFavourite.daysBefore.length > 0
				) {
					try {
						await scheduleNameDayNotifications(
							favourite.name,
							favourite.day,
							favourite.month,
							updatedFavourite.daysBefore,
						);
					} catch (error) {
						console.error("Error scheduling notifications:", error);
						throw error;
					}
				}

				if (day === 0) {
					Toast.show({
						type: "success",
						text1: t("notifications.notificationScheduled"),
						text2: t("notifications.reminderSet", {name: favourite.name}),
						position: "bottom",
					});
				} else {
					const daysText =
						day === 1
							? t("notifications.reminderSetDay", {name: favourite.name})
							: t("notifications.reminderSetSpecificDay", {
									name: favourite.name,
									days: day,
								});

					Toast.show({
						type: "success",
						text1: t("notifications.notificationScheduled"),
						text2: daysText,
						position: "bottom",
					});
				}
			} else {
				if (day === 0) {
					Toast.show({
						type: "info",
						text1: t("notifications.notificationCancelled"),
						text2: t("notifications.reminderRemoved", {name: favourite.name}),
						position: "bottom",
					});
				} else {
					const daysText =
						day === 1
							? t("notifications.reminderRemovedDay", {name: favourite.name})
							: t("notifications.reminderRemovedDays", {
									name: favourite.name,
									days: day,
								});

					Toast.show({
						type: "info",
						text1: t("notifications.notificationCancelled"),
						text2: daysText,
						position: "bottom",
					});
				}
			}
		} catch (error) {
			console.error("Error toggling days before:", error);
			Toast.show({
				type: "error",
				text1: t("common.error"),
				text2: t("notifications.updateSettingsError"),
				position: "bottom",
			});
		}
	};

	return (
		<View style={styles.container}>
			{groupedData.map((monthData) => (
				<Accordion.Sibling key={`${monthData.month}-sibling`}>
					<View key={monthData.month} style={styles.monthBlock}>
						<Text variant="header" color="black" style={styles.monthTitle}>
							{t(`months.${monthData.month}`)}
						</Text>
						{monthData.days.map((dayData) => (
							<View
								key={`${monthData.month}-${dayData.day}`}
								style={styles.dayBlock}
							>
								<Text variant="body" style={styles.dayTitle}>
									{dayData.day}
								</Text>
								<View style={styles.namesContainer}>
									{dayData.favourites.map((favourite, index) => (
										<View
											key={`${favourite.name}-${index}`}
											style={styles.nameWrapper}
										>
											<Accordion.Sibling
												key={`${favourite.name}-${index}-sibling`}
											>
												<Accordion.Accordion
													key={`${favourite.name}-${index}`}
													style={styles.accordion}
													onChange={(isOpen) =>
														handleAccordionChange(isOpen, favourite.name, index)
													}
													isOpen={autoOpenAccordions.has(
														`${favourite.name}-${index}`,
													)}
												>
													<Accordion.Header>
														<View style={styles.headerContent}>
															<View style={styles.nameContainer}>
																{isTodayNameDay(
																	favourite.day,
																	favourite.month,
																) && (
																	<Star1
																		size="16"
																		variant="Bold"
																		color={colors.primary}
																		style={styles.starIcon}
																	/>
																)}
																<Text
																	variant="body"
																	style={[
																		styles.nameText,
																		shouldHighlight(favourite.name) &&
																			styles.highlightedName,
																	]}
																>
																	{favourite.name}
																</Text>
															</View>
															<Accordion.HeaderIcon rotation="clockwise">
																<ArrowDown2 size="25" color={colors.primary} />
															</Accordion.HeaderIcon>
														</View>
													</Accordion.Header>

													<Accordion.Expanded style={styles.accordionContent}>
														<Pressable
															style={styles.checkboxRow}
															onPress={() =>
																handleRemoveFavourite(favourite.name)
															}
														>
															<Text style={styles.checkboxDescription}>
																{t("favourites.actions.unfavourite")}
															</Text>
															<Checkbox
																checked={true}
																onUnCheckedChange={() =>
																	handleRemoveFavourite(favourite.name)
																}
																onCheckedChange={() => {}}
															/>
														</Pressable>

														<Pressable
															style={styles.checkboxRow}
															onPress={() =>
																handleNotificationToggle(
																	favourite,
																	!favourite.notifyMe,
																)
															}
														>
															<Text style={styles.checkboxDescription}>
																{favourite.notifyMe
																	? t("favourites.actions.dontNotifyMe")
																	: t("favourites.actions.notifyMe")}
															</Text>
															<Checkbox
																checked={favourite.notifyMe || false}
																onCheckedChange={() =>
																	handleNotificationToggle(favourite, true)
																}
																onUnCheckedChange={() =>
																	handleNotificationToggle(favourite, false)
																}
															/>
														</Pressable>

														{favourite.notifyMe && (
															<>
																<Text style={styles.checkboxDescription}>
																	{t("favourites.daysBefore")}:
																</Text>
																<View style={styles.timingButtonsContainer}>
																	<Pressable
																		style={[
																			styles.timingButton,
																			(favourite.daysBefore || []).includes(
																				0,
																			) && styles.timingButtonSelected,
																		]}
																		onPress={() =>
																			handleDaysBeforeToggle(favourite, 0)
																		}
																	>
																		<Text
																			style={[
																				styles.timingButtonText,
																				(favourite.daysBefore || []).includes(
																					0,
																				) && {
																					color: "white",
																				},
																			]}
																		>
																			{t("favourites.onTheDay")}
																		</Text>
																	</Pressable>
																	<View style={styles.daysBeforeButtons}>
																		{[1, 2, 3, 4, 5].map((day) => (
																			<Pressable
																				key={day}
																				style={[
																					styles.dayButton,
																					(favourite.daysBefore || []).includes(
																						day,
																					) && styles.dayButtonSelected,
																				]}
																				onPress={() =>
																					handleDaysBeforeToggle(favourite, day)
																				}
																			>
																				<Text
																					style={[
																						styles.dayButtonText,
																						(
																							favourite.daysBefore || []
																						).includes(day) &&
																							styles.dayButtonTextSelected,
																					]}
																				>
																					{day}
																				</Text>
																			</Pressable>
																		))}
																	</View>
																</View>
															</>
														)}

														{isTodayNameDay(favourite.day, favourite.month) && (
															<Button
																variant="outline"
																onPress={() =>
																	handleShareWishes(favourite.name)
																}
															>
																<Text style={styles.shareButtonText}>
																	{t("favourites.shareWishes")}
																</Text>
															</Button>
														)}
													</Accordion.Expanded>
												</Accordion.Accordion>
											</Accordion.Sibling>
										</View>
									))}
								</View>
							</View>
						))}
					</View>
				</Accordion.Sibling>
			))}
		</View>
	);
};

const styles = StyleSheet.create(({colors, sizes, tokens}) => ({
	container: {
		flex: 1,
		paddingVertical: sizes["16px"],
		paddingLeft: sizes["10px"],
		paddingRight: sizes["20px"],
	},
	monthBlock: {
		marginBottom: sizes["16px"],
	},
	monthTitle: {
		marginBottom: sizes["16px"],
		fontSize: sizes["24px"],
		fontWeight: "bold",
		color: tokens.text.primary,
	},
	dayBlock: {
		marginBottom: sizes["20px"],
		paddingLeft: sizes["12px"],
	},
	dayTitle: {
		fontSize: sizes["16px"],
		fontWeight: "600",
		marginBottom: sizes["8px"],
		color: colors.primary,
	},
	namesContainer: {
		gap: sizes["8px"],
	},
	nameWrapper: {
		marginBottom: sizes["8px"],
	},
	accordion: {
		marginBottom: sizes["8px"],
		backgroundColor: tokens.background.row,
		borderRadius: sizes["8px"],
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.lightGrey,
		padding: sizes["10px"],
		overflow: "hidden",
	},
	accordionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: sizes["12px"],
		paddingVertical: sizes["12px"],
	},
	headerContent: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
	},
	nameContainer: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	nameText: {
		flex: 1,
		fontSize: sizes["16px"],
		fontWeight: "700",
	},
	highlightedName: {
		backgroundColor: colors.primary,
		color: "white",
		paddingHorizontal: sizes["8px"],
		paddingVertical: sizes["4px"],
		borderRadius: sizes["4px"],
	},
	starIcon: {
		marginRight: sizes["8px"],
	},
	accordionContent: {
		paddingHorizontal: sizes["12px"],
		paddingVertical: sizes["16px"],
		gap: sizes["12px"],
	},
	checkboxRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	checkboxLabel: {
		fontSize: sizes["16px"],
	},
	checkboxDescription: {
		flex: 1,
		backgroundColor: "transparent",
		paddingVertical: sizes["4px"],
	},
	daysBeforeLabel: {
		fontSize: sizes["16px"],
		fontWeight: "600",
		marginTop: sizes["8px"],
		marginBottom: sizes["8px"],
		color: tokens.text.primary,
	},
	timingButtonsContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: sizes["8px"],
		width: "100%",
	},
	timingButton: {
		backgroundColor: "white",
		borderWidth: 1,
		borderColor: colors.primary,
		paddingHorizontal: sizes["12px"],
		paddingVertical: sizes["8px"],
		borderRadius: sizes["8px"],
	},
	timingButtonText: {
		color: colors.primary,
		fontSize: sizes["15px"],
		fontWeight: "600",
	},
	timingButtonSelected: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	daysBeforeButtons: {
		flexDirection: "row",
		gap: sizes["4px"],
		flex: 1,
	},
	dayButton: {
		flex: 1,
		height: sizes["32px"],
		borderRadius: sizes["6px"],
		borderWidth: 1,
		borderColor: colors.primary,
		backgroundColor: "white",
		justifyContent: "center",
		alignItems: "center",
	},
	dayButtonText: {
		color: colors.primary,
		fontSize: sizes["15px"],
		fontWeight: "600",
	},
	dayButtonSelected: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	dayButtonTextSelected: {
		color: "white",
	},
	shareButtonText: {
		color: colors.primary,
		fontSize: sizes["16px"],
		fontWeight: "600",
	},
}));
