import {Accordion} from "@animatereactnative/accordion";
import {ArrowDown2} from "iconsax-react-native";
import React from "react";
import {useTranslation} from "react-i18next";
import {StyleSheet} from "react-native-unistyles";

import type {Favourite} from "@/app/store/favourites";
import {favourites$} from "@/app/store/favourites";
import {Checkbox} from "@/app/ui/components/Checkbox";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {
	cancelNameDayNotifications,
	requestNotificationPermissions,
	scheduleNameDayNotifications,
} from "@/app/utils/notifications";
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

	// Group by month, then by day
	for (const favourite of favourites) {
		if (!grouped[favourite.month]) {
			grouped[favourite.month] = {};
		}
		if (!grouped[favourite.month][favourite.day]) {
			grouped[favourite.month][favourite.day] = [];
		}
		grouped[favourite.month][favourite.day].push(favourite);
	}

	// Convert to array format and sort by month order
	return Object.entries(grouped)
		.map(([month, days]) => ({
			month,
			days: Object.entries(days).map(([day, favourites]) => ({
				day,
				names: favourites.map((f) => f.name),
				favourites: favourites,
			})),
		}))
		.sort((a, b) => {
			const aIndex = MONTH_ORDER.indexOf(a.month);
			const bIndex = MONTH_ORDER.indexOf(b.month);
			return aIndex - bIndex;
		});
}

export function GroupedNamesAccordion({favourites}: Props) {
	const {t} = useTranslation();
	const groupedData = groupFavouritesByMonthAndDay(favourites);

	const handleNotificationToggle = async (
		favourite: Favourite,
		enabled: boolean,
	) => {
		let hasPermission = false;

		try {
			if (enabled) {
				hasPermission = await requestNotificationPermissions();
				if (hasPermission) {
					await scheduleNameDayNotifications(
						favourite.name,
						favourite.day,
						favourite.month,
					);
				} else {
					Toast.show({
						type: "error",
						text1: t("notifications.permissionRequired"),
						position: "bottom",
					});
				}
			} else {
				await cancelNameDayNotifications(
					favourite.name,
					favourite.day,
					favourite.month,
				);
			}

			favourites$.toggleNotification(favourite.name, enabled && hasPermission);
		} catch (error) {
			favourites$.toggleNotification(favourite.name, false);
		}
	};

	const handleRemoveFavourite = (name: string) => {
		favourites$.removeFavourite(name);
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
										<Accordion.Sibling
											key={`${favourite.name}-${index}-sibling`}
										>
											<Accordion.Accordion
												key={`${favourite.name}-${index}`}
												style={styles.accordion}
											>
												<Accordion.Header>
													<View style={styles.headerContent}>
														<Text variant="body" style={styles.nameText}>
															{favourite.name}
														</Text>
														<Accordion.HeaderIcon rotation="clockwise">
															<ArrowDown2 size="25" color={colors.primary} />
														</Accordion.HeaderIcon>
													</View>
												</Accordion.Header>

												<Accordion.Expanded style={styles.accordionContent}>
													<View style={styles.checkboxRow}>
														<Text style={styles.checkboxDescription}>
															❤️ {t("favourites.actions.unfavourite")}
														</Text>
														<Checkbox
															checked={true}
															onUnCheckedChange={() =>
																handleRemoveFavourite(favourite.name)
															}
															onCheckedChange={() => {}}
														/>
													</View>

													<View style={styles.checkboxRow}>
														<Text style={styles.checkboxDescription}>
															🔔{" "}
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
													</View>
												</Accordion.Expanded>
											</Accordion.Accordion>
										</Accordion.Sibling>
									))}
								</View>
							</View>
						))}
					</View>
				</Accordion.Sibling>
			))}
		</View>
	);
}

const styles = StyleSheet.create(({colors, sizes}) => ({
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
		// paddingLeft: sizes["12px"],
	},
	accordion: {
		marginBottom: sizes["8px"],
		backgroundColor: colors.grey2,
		borderRadius: sizes["8px"],
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.lightGrey,
		padding: sizes["10px"],
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
	nameText: {
		flex: 1,
		fontSize: sizes["16px"],
		fontWeight: "700",
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
}));
