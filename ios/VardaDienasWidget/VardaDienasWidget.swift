  //  VardaDienasWidget.swift
//  VardaDienasWidget
//
//  Created by Niall Barber on 14/06/2025.

import WidgetKit
import SwiftUI
import Foundation

// MARK: - Colors
extension Color {
    static let widgetBackground = Color(red: 0xA4 / 255, green: 0x34 / 255, blue: 0x3A / 255)
    static let widgetForeground = Color.white
    static let widgetSecondary = Color(red: 0xFC / 255, green: 0xFC / 255, blue: 0xFC / 255)
    
    // Inverted colors for the second widget variant
    static let widgetBackgroundInverted = Color.white
    static let widgetForegroundInverted = Color(red: 0xA4 / 255, green: 0x34 / 255, blue: 0x3A / 255)
    static let widgetSecondaryInverted = Color(red: 0x66 / 255, green: 0x66 / 255, blue: 0x66 / 255)
}

// MARK: - Data Models
struct NameDayData: Codable {
    let vardūs: [VardūsItem]
}

enum VardūsItem: Codable {
    case month(String)
    case day(DayData)

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let monthName = try? container.decode(String.self) {
            self = .month(monthName)
        } else if let dayData = try? container.decode(DayData.self) {
            self = .day(dayData)
        } else {
            throw DecodingError.typeMismatch(VardūsItem.self, DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Expected String or DayData"))
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .month(let month):
            try container.encode(month)
        case .day(let dayData):
            try container.encode(dayData)
        }
    }
}

struct DayData: Codable {
    let diena: String
    let vardi: [String]
    let citiVardi: [String]
}

struct TodayNameDay {
    let month: String
    let day: String
    let vardi: [String]
    let citiVardi: [String]
    let isToday: Bool
}

// MARK: - Widget Provider
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), nameDay: TodayNameDay(
            month: "Loading...",
            day: "00",
            vardi: ["Loading..."],
            citiVardi: [],
            isToday: false
        ))
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), nameDay: getTodaysNameDay())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let currentDate = Date()
        let entry = SimpleEntry(date: currentDate, nameDay: getTodaysNameDay())
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: currentDate)!
        let midnight = Calendar.current.startOfDay(for: tomorrow)
        let timeline = Timeline(entries: [entry], policy: .after(midnight))
        completion(timeline)
    }

    private func getTodaysNameDay() -> TodayNameDay {
        let today = Date()
        let calendar = Calendar.current
        let day = String(format: "%02d", calendar.component(.day, from: today))
        let month = calendar.component(.month, from: today)

        let latvianMonths = [
            "Janvāris", "Februāris", "Marts", "Aprīlis", "Maijs", "Jūnijs",
            "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris"
        ]

        guard let nameData = loadNameDayData() else {
            return TodayNameDay(month: "Error", day: day, vardi: ["No data"], citiVardi: [], isToday: false)
        }

        var currentMonth = ""
        for item in nameData.vardūs {
            switch item {
            case .month(let monthName):
                currentMonth = monthName
            case .day(let dayData):
                if dayData.diena == day && currentMonth == latvianMonths[month - 1] {
                    return TodayNameDay(
                        month: currentMonth,
                        day: day,
                        vardi: dayData.vardi,
                        citiVardi: dayData.citiVardi,
                        isToday: true
                    )
                }
            }
        }

        return TodayNameDay(month: "Unknown", day: day, vardi: ["No names"], citiVardi: [], isToday: false)
    }

    private func loadNameDayData() -> NameDayData? {
        guard let url = Bundle.main.url(forResource: "vardūs", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let nameData = try? JSONDecoder().decode(NameDayData.self, from: data) else {
            return nil
        }
        return nameData
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let nameDay: TodayNameDay
}

// MARK: - Helper
func getShortMonth(_ month: String) -> String {
    let shortMonths = [
        "Janvāris": "Jan", "Februāris": "Feb", "Marts": "Mar",
        "Aprīlis": "Apr", "Maijs": "Mai", "Jūnijs": "Jūn",
        "Jūlijs": "Jūl", "Augusts": "Aug", "Septembris": "Sep",
        "Oktobris": "Okt", "Novembris": "Nov", "Decembris": "Dec"
    ]
    return shortMonths[month] ?? month
}

func formatNames(_ names: [String]) -> String {
    if names.isEmpty { return "" }
    if names.count == 1 { return names[0] }
    if names.count == 2 { return "\(names[0]) un \(names[1])" }
    
    // For 3 or more names, use commas and "un" before the last one
    let allButLast = names.dropLast()
    let last = names.last!
    return "\(allButLast.joined(separator: ", ")) un \(last)"
}

func formatNamesWithEllipsis(_ names: [String], maxLines: Int = 2) -> String {
    let formatted = formatNames(names)
    
    // For 2 lines, allow much more text - approximately 120-150 characters
    // This ensures the "Citi:" section has enough content to wrap to 2 lines
    let maxChars = maxLines == 2 ? 150 : 50
    if formatted.count <= maxChars {
        return formatted
    }
    
    // Truncate and add ellipsis
    let truncated = String(formatted.prefix(maxChars - 3))
    return truncated + "..."
}

func formatNamesForTwoLines(_ names: [String]) -> (String, String) {
    let formatted = formatNames(names)
    
    // Split the text roughly in half to force it onto 2 lines
    let words = formatted.components(separatedBy: " ")
    if words.count <= 3 {
        return (formatted, "")
    }
    
    let midPoint = words.count / 2
    let firstLine = words[..<midPoint].joined(separator: " ")
    let secondLine = words[midPoint...].joined(separator: " ")
    
    return (firstLine, secondLine)
}

func formatNamesForTwoLinesWithEllipsis(_ names: [String]) -> String {
    let formatted = formatNames(names)
    return formatted
}

// MARK: - Widget Views
struct NameDayWidgetEntryView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemMedium:
            MediumNameDayView(nameDay: entry.nameDay)
                .containerBackground(Color.widgetBackground, for: .widget)
        default:
            EmptyView()
        }
    }
}

struct NameDayWidgetInvertedEntryView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemMedium:
            MediumNameDayViewInverted(nameDay: entry.nameDay)
                .containerBackground(Color.widgetBackgroundInverted, for: .widget)
        default:
            EmptyView()
        }
    }
}

struct MediumNameDayView: View {
    let nameDay: TodayNameDay

    var body: some View {
        HStack(spacing: 12) {
            // Left side - Text content (give it more space)
            VStack(alignment: .leading, spacing: 6) {
                // Main names
                Text(formatNamesWithEllipsis(nameDay.vardi, maxLines: 2))
                    .font(.custom("PlusJakartaSans-Bold", size: 16))
                    .foregroundColor(.widgetForeground)
                    .multilineTextAlignment(.leading)
                    .lineLimit(2)
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                // Additional names section
                if !nameDay.citiVardi.isEmpty {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Citi:")
                            .font(.custom("PlusJakartaSans-Bold", size: 12))
                            .foregroundColor(.widgetForeground)
                        
                        Text(formatNamesWithEllipsis(Array(nameDay.citiVardi.prefix(8)), maxLines: 2))
                            .font(.custom("PlusJakartaSans-Bold", size: 12))
                            .foregroundColor(.widgetForeground)
                            .multilineTextAlignment(.leading)
                            .lineLimit(2)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
                
                Spacer()
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            // Right side - Date and Wreath (make it narrower)
            VStack(spacing: 8) {
                // Date at top
                Text("\(nameDay.day). \(getShortMonth(nameDay.month))")
                    .font(.custom("PlusJakartaSans-Bold", size: 14))
                    .foregroundColor(.widgetForeground)
                
                // Wreath image
                Image("Wreath")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 60, height: 60)
                
                Spacer()
            }
            .frame(width: 70, alignment: .center)
        }
        .padding(12)
    }
}

struct MediumNameDayViewInverted: View {
    let nameDay: TodayNameDay

    var body: some View {
        HStack(spacing: 12) {
            // Left side - Text content (give it more space)
            VStack(alignment: .leading, spacing: 6) {
                // Main names
                Text(formatNamesWithEllipsis(nameDay.vardi, maxLines: 2))
                    .font(.custom("PlusJakartaSans-Bold", size: 16))
                    .foregroundColor(.widgetForegroundInverted)
                    .multilineTextAlignment(.leading)
                    .lineLimit(2)
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                // Additional names section
                if !nameDay.citiVardi.isEmpty {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Citi:")
                            .font(.custom("PlusJakartaSans-Bold", size: 12))
                            .foregroundColor(.widgetForegroundInverted)
                        
                        Text(formatNamesWithEllipsis(Array(nameDay.citiVardi.prefix(8)), maxLines: 2))
                            .font(.custom("PlusJakartaSans-Bold", size: 12))
                            .foregroundColor(.widgetForegroundInverted)
                            .multilineTextAlignment(.leading)
                            .lineLimit(2)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
                
                Spacer()
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            // Right side - Date and Wreath (make it narrower)
            VStack(spacing: 8) {
                // Date at top
                Text("\(nameDay.day). \(getShortMonth(nameDay.month))")
                    .font(.custom("PlusJakartaSans-Bold", size: 14))
                    .foregroundColor(.widgetForegroundInverted)
                
                // Wreath image
                Image("Wreath")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 60, height: 60)
                
                Spacer()
            }
            .frame(width: 70, alignment: .center)
        }
        .padding(12)
    }
}

// MARK: - Widget Configuration
struct NameDayWidget: Widget {
    let kind: String = "NameDayWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            NameDayWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Vārda diena")
        .description("Rāda šodienas vārda dienas")
        .supportedFamilies([.systemMedium])
    }
}

struct NameDayWidgetInverted: Widget {
    let kind: String = "NameDayWidgetInverted"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            NameDayWidgetInvertedEntryView(entry: entry)
        }
        .configurationDisplayName("Vārda diena (balta)")
        .description("Rāda šodienas vārda dienas ar baltu fonu")
        .supportedFamilies([.systemMedium])
    }
}
