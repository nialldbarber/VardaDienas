import {use$} from "@legendapp/state/react";
import {useNavigation, type StaticScreenProps} from "@react-navigation/native";
import {ArrowLeft} from "iconsax-react-native";
import React from "react";
import {useTranslation} from "react-i18next";
import {Pressable, View, type ScrollView} from "react-native";
import {StyleSheet} from "react-native-unistyles";

import {CheckboxRow} from "@/app/modules/Home/components/CheckboxRow";
import {favourites$} from "@/app/store/favourites";
import {settings$} from "@/app/store/settings";
import type {DayData} from "@/app/types";
import {Text} from "@/app/ui/components/Text";
import {Layout} from "@/app/ui/components/layout";
import {colors} from "@/app/ui/config/colors";
import {formatDateHeader} from "@/app/utils/dateFormat";
import {haptics} from "@/app/utils/haptics";

type Props = StaticScreenProps<{
	data: DayData;
	month: string | null;
	selectedName?: string | null;
}>;

export function NamesRowScreen({
	route: {
		params: {data, month, selectedName},
	},
}: Props) {
	const {t} = useTranslation();
	const {goBack} = useNavigation();
	const favourites = use$(favourites$.favourites);
	const hapticsEnabled = use$(settings$.haptics);
	const layoutRef = React.useRef<ScrollView>(null);

	// Scroll to highlighted name when component mounts
	React.useEffect(() => {
		if (selectedName && layoutRef.current) {
			// Add a small delay to ensure the component is fully rendered
			const timer = setTimeout(() => {
				// Calculate approximate position of the highlighted name
				let targetY = 0;

				// Add header height (approximately 50px)
				targetY += 50;

				// Add section title height and padding
				targetY += 60; // "Vārdi" section title + padding

				// Find the position of the highlighted name
				const allNames = [...data.vardi, ...data.citiVardi];
				const nameIndex = allNames.indexOf(selectedName);

				if (nameIndex !== -1) {
					// Calculate position based on name index
					// Each name row is approximately 50px (including padding)
					const rowHeight = 50;

					// If it's in the second section, add the first section height
					if (data.vardi.includes(selectedName)) {
						// It's in the first section
						const vardiIndex = data.vardi.indexOf(selectedName);
						targetY += vardiIndex * rowHeight;
					} else {
						// It's in the second section
						targetY += data.vardi.length * rowHeight; // First section height
						targetY += 40; // Spacer between sections
						targetY += 60; // "Citi vārdi" section title + padding
						const citiVardiIndex = data.citiVardi.indexOf(selectedName);
						targetY += citiVardiIndex * rowHeight;
					}

					// Scroll to the position with some offset for better visibility
					if (layoutRef.current) {
						layoutRef.current.scrollTo({
							y: Math.max(0, targetY - 100), // Offset by 100px for better visibility
							animated: true,
						});
					}
				}
			}, 300);

			return () => clearTimeout(timer);
		}
	}, [selectedName, data.vardi, data.citiVardi]);

	// Helper function to format names with proper punctuation
	function formatNames(names: string[]): string {
		if (names.length === 0) return "";
		if (names.length === 1) return names[0];
		if (names.length === 2) return `${names[0]} ${t("common.and")} ${names[1]}`;

		// For 3 or more names, use commas and "and" before the last one
		const allButLast = names.slice(0, -1);
		const last = names[names.length - 1];
		return `${allButLast.join(", ")} ${t("common.and")} ${last}`;
	}

	return (
		<Layout
			ref={layoutRef}
			withScroll="vertical"
			header={
				<View style={styles.headerRow}>
					<Pressable
						onPress={() => {
							if (hapticsEnabled) {
								haptics.impactMedium();
							}
							goBack();
						}}
					>
						<ArrowLeft size="25" color={colors.white} variant="Outline" />
					</Pressable>
					<Text style={[styles.header, styles.headerText]}>
						{month
							? formatDateHeader(data.diena, t(`months.${month}`))
							: data.diena}
					</Text>
				</View>
			}
		>
			<View style={styles.container}>
				{data.vardi.length > 0 && (
					<View>
						<Text style={styles.header}>{t("home.names")}</Text>
						<View style={styles.sectionBlock}>
							{data.vardi.map((vards, index) => {
								const isChecked = favourites.some((fav) => fav.name === vards);
								const isLast = index === data.vardi.length - 1;
								const isHighlighted = selectedName === vards;
								return (
									<CheckboxRow
										key={`vardi-${vards}`}
										vards={vards}
										isChecked={isChecked}
										data={data}
										month={month}
										isLast={isLast}
										isHighlighted={isHighlighted}
									/>
								);
							})}
						</View>
					</View>
				)}

				{data.vardi.length > 0 && data.citiVardi.length > 0 && (
					<View style={styles.spacer} />
				)}

				{data.citiVardi.length > 0 && (
					<View>
						<Text style={styles.header}>{t("home.otherNames")}</Text>
						<View style={styles.sectionBlock}>
							{data.citiVardi.map((vards, index) => {
								const isChecked = favourites.some((fav) => fav.name === vards);
								const isLast = index === data.citiVardi.length - 1;
								const isHighlighted = selectedName === vards;
								return (
									<CheckboxRow
										key={`citi-vardi-${vards}`}
										vards={vards}
										isChecked={isChecked}
										data={data}
										month={month}
										isLast={isLast}
										isHighlighted={isHighlighted}
									/>
								);
							})}
						</View>
					</View>
				)}
			</View>
		</Layout>
	);
}

const styles = StyleSheet.create(({colors, sizes, tokens}) => ({
	headerRow: {
		backgroundColor: colors.primary,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: sizes["10px"],
		height: 50,
	},
	header: {
		fontSize: 25,
		fontWeight: "800",
		color: tokens.text.primary,
	},
	headerText: {
		color: colors.white,
	},
	container: {
		padding: sizes["10px"],
	},
	sectionBlock: {
		backgroundColor: tokens.background.row,
		borderRadius: sizes["8px"],
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.lightGrey,
		padding: sizes["12px"],
		marginVertical: sizes["8px"],
	},
	spacer: {
		height: 20,
	},
}));
