import {notifications$} from "@/app/store/notifications";
import {colors} from "@/app/ui/config/colors";
import {sizes} from "@/app/ui/config/sizes";
import React from "react";
import {
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

type TimePickerModalProps = {
	visible: boolean;
	onClose: () => void;
	onConfirm: (time: {hours: number; minutes: number}) => void;
	title?: string;
};

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
	visible,
	onClose,
	onConfirm,
	title = "Set notification time",
}) => {
	const currentTime = notifications$.notificationTime.get();
	const [selectedHours, setSelectedHours] = React.useState(currentTime.hours);
	const [selectedMinutes, setSelectedMinutes] = React.useState(
		currentTime.minutes,
	);

	// Refs for the scroll views
	const hoursScrollRef = React.useRef<ScrollView>(null);
	const minutesScrollRef = React.useRef<ScrollView>(null);

	React.useEffect(() => {
		if (visible) {
			setSelectedHours(currentTime.hours);
			setSelectedMinutes(currentTime.minutes);

			// Scroll to the current time after a short delay to ensure the modal is rendered
			setTimeout(() => {
				hoursScrollRef.current?.scrollTo({
					y: currentTime.hours * 40,
					animated: false,
				});
				minutesScrollRef.current?.scrollTo({
					y: (currentTime.minutes / 5) * 40,
					animated: false,
				});
			}, 100);
		}
	}, [visible, currentTime]);

	const handleConfirm = () => {
		onConfirm({
			hours: selectedHours,
			minutes: selectedMinutes,
		});
		onClose();
	};

	const handleCancel = () => {
		// Reset to current time when canceling
		setSelectedHours(currentTime.hours);
		setSelectedMinutes(currentTime.minutes);
		onClose();
	};

	const formatNumber = (num: number) => num.toString().padStart(2, "0");

	// Generate arrays for hours and minutes
	const hours = Array.from({length: 24}, (_, i) => i);
	const minutes = Array.from({length: 12}, (_, i) => i * 5); // 0, 5, 10, 15, etc.

	const renderPickerItem = (value: number, isSelected: boolean) => (
		<Text style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}>
			{formatNumber(value)}
		</Text>
	);

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={handleCancel}
		>
			<Pressable style={styles.overlay} onPress={handleCancel}>
				<Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
					<Text style={styles.title}>{title}</Text>

					<View style={styles.timeContainer}>
						<View style={styles.timeSection}>
							<Text style={styles.timeLabel}>Hours</Text>
							<View style={styles.pickerContainer}>
								<ScrollView
									ref={hoursScrollRef}
									showsVerticalScrollIndicator={false}
									snapToInterval={40}
									decelerationRate="fast"
									onMomentumScrollEnd={(event) => {
										const index = Math.round(
											event.nativeEvent.contentOffset.y / 40,
										);
										setSelectedHours(hours[index] || 0);
									}}
								>
									{/* Add padding items at top and bottom */}
									<View style={styles.pickerPadding} />
									{hours.map((hour) => (
										<Pressable
											key={hour}
											style={styles.pickerItemContainer}
											onPress={() => setSelectedHours(hour)}
										>
											{renderPickerItem(hour, hour === selectedHours)}
										</Pressable>
									))}
									<View style={styles.pickerPadding} />
								</ScrollView>
							</View>
						</View>

						<Text style={styles.separator}>:</Text>

						<View style={styles.timeSection}>
							<Text style={styles.timeLabel}>Minutes</Text>
							<View style={styles.pickerContainer}>
								<ScrollView
									ref={minutesScrollRef}
									showsVerticalScrollIndicator={false}
									snapToInterval={40}
									decelerationRate="fast"
									onMomentumScrollEnd={(event) => {
										const index = Math.round(
											event.nativeEvent.contentOffset.y / 40,
										);
										setSelectedMinutes(minutes[index] || 0);
									}}
								>
									{/* Add padding items at top and bottom */}
									<View style={styles.pickerPadding} />
									{minutes.map((minute) => (
										<Pressable
											key={minute}
											style={styles.pickerItemContainer}
											onPress={() => setSelectedMinutes(minute)}
										>
											{renderPickerItem(minute, minute === selectedMinutes)}
										</Pressable>
									))}
									<View style={styles.pickerPadding} />
								</ScrollView>
							</View>
						</View>
					</View>

					<View style={styles.buttonContainer}>
						<Pressable style={styles.cancelButton} onPress={handleCancel}>
							<Text style={styles.cancelButtonText}>Cancel</Text>
						</Pressable>
						<Pressable style={styles.confirmButton} onPress={handleConfirm}>
							<Text style={styles.confirmButtonText}>Confirm</Text>
						</Pressable>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modal: {
		backgroundColor: colors.black,
		borderRadius: sizes["12px"],
		padding: sizes["24px"],
		width: "90%",
		maxWidth: 500,
	},
	title: {
		color: colors.white,
		fontSize: 18,
		fontWeight: "600",
		textAlign: "center",
		marginBottom: sizes["24px"],
	},
	timeContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: sizes["32px"],
	},
	timeSection: {
		alignItems: "center",
	},
	timeLabel: {
		color: colors.grey,
		fontSize: 12,
		marginBottom: sizes["8px"],
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	pickerContainer: {
		height: 120,
		width: 80,
		position: "relative",
	},
	pickerItemContainer: {
		height: 40,
		justifyContent: "center",
		alignItems: "center",
	},
	pickerItem: {
		color: colors.grey,
		fontSize: 20,
		fontWeight: "500",
	},
	pickerItemSelected: {
		color: colors.white,
		fontSize: 24,
		fontWeight: "700",
	},
	pickerPadding: {
		height: 40,
	},
	separator: {
		color: colors.white,
		fontSize: 32,
		fontWeight: "700",
		marginHorizontal: sizes["16px"],
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: sizes["12px"],
	},
	cancelButton: {
		flex: 1,
		paddingVertical: sizes["12px"],
		paddingHorizontal: sizes["16px"],
		borderRadius: sizes["8px"],
		borderWidth: 1,
		borderColor: colors.grey,
		alignItems: "center",
	},
	cancelButtonText: {
		color: colors.grey,
		fontSize: 16,
		fontWeight: "500",
	},
	confirmButton: {
		flex: 1,
		paddingVertical: sizes["12px"],
		paddingHorizontal: sizes["16px"],
		borderRadius: sizes["8px"],
		backgroundColor: colors.primary,
		alignItems: "center",
	},
	confirmButtonText: {
		color: colors.white,
		fontSize: 16,
		fontWeight: "600",
	},
});
