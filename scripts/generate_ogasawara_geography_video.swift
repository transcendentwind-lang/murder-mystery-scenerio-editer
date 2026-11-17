import Foundation
import CoreGraphics
import CoreText
import ImageIO
import AVFoundation
import UniformTypeIdentifiers

// MARK: - Math & Easing Helpers

let W: Double = 1920.0
let H: Double = 1080.0
let FPS: Int32 = 30
let DURATION: Double = 24.0
let TOTAL_FRAMES: Int = Int(DURATION * Double(FPS))

func clamp(_ x: Double, _ a: Double = 0.0, _ b: Double = 1.0) -> Double {
    return min(max(x, a), b)
}

func progress(_ t: Double, _ t0: Double, _ t1: Double) -> Double {
    guard t1 > t0 else { return t >= t1 ? 1.0 : 0.0 }
    return clamp((t - t0) / (t1 - t0))
}

func easeInOutCubic(_ x: Double) -> Double {
    let t = clamp(x)
    return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2
}

func easeOutCubic(_ x: Double) -> Double {
    let t = clamp(x)
    return 1 - pow(1 - t, 3)
}

func easeOutBack(_ x: Double) -> Double {
    let t = clamp(x)
    let c1 = 1.70158
    let c3 = c1 + 1.0
    return 1 + c3 * pow(t - 1, 3) + c1 * pow(t - 1, 2)
}

func lerp(_ a: Double, _ b: Double, _ t: Double) -> Double {
    return a + (b - a) * t
}

// MARK: - Geographic Projection (Cosine-corrected km relative to Tokyo Bay)
// Origin: Tokyo Bay (Takeshiba) 35.65°N, 139.76°E -> (0, 0)
// +X = East (km), +Y = South (km)

let ORIGIN_LAT = 35.65
let ORIGIN_LON = 139.76
let KM_PER_LAT = 111.1
let KM_PER_LON = 95.2 // cos(31°N) * 111.3

struct GeoPoint {
    let lat: Double
    let lon: Double
    var wx: Double { (lon - ORIGIN_LON) * KM_PER_LON }
    var wy: Double { (ORIGIN_LAT - lat) * KM_PER_LAT }
}

struct Camera {
    var centerWX: Double
    var centerWY: Double
    var pxPerKm: Double
    var screenCenterX: Double
    var screenCenterY: Double

    func toScreen(_ gp: GeoPoint) -> CGPoint {
        return toScreenXY(gp.wx, gp.wy)
    }

    func toScreenXY(_ wx: Double, _ wy: Double) -> CGPoint {
        let sx = screenCenterX + (wx - centerWX) * pxPerKm
        let sy = screenCenterY + (wy - centerWY) * pxPerKm
        return CGPoint(x: sx, y: sy)
    }
}

// MARK: - Color Helpers

func rgba(_ r: Int, _ g: Int, _ b: Int, _ a: Double = 1.0) -> CGColor {
    return CGColor(
        colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!,
        components: [CGFloat(r) / 255.0, CGFloat(g) / 255.0, CGFloat(b) / 255.0, CGFloat(a)]
    )!
}

// MARK: - Geographic Data (Pure Geography / Atlas Style)

// High-precision WGS84 coastline of Honshu (clockwise: Shimokita -> Sanriku -> Sendai -> Joban -> Kashima -> Choshi -> Kujukuri -> Boso -> Tokyo Bay -> Miura -> Sagami -> Izu -> Suruga -> Enshu -> Atsumi -> Mikawa -> Chita -> Ise -> Shima -> Kii -> Osaka -> Seto -> Shimonoseki -> San'in -> Wakasa -> Noto -> Toyama -> Niigata -> Oga -> Tsugaru)
let honshuLandRaw: [(Double, Double)] = [
    // Shimokita & Sanriku Coast
    (41.54, 140.91), (41.43, 141.46), (41.10, 141.39), (40.53, 141.55), (40.19, 141.80),
    (39.85, 141.98), (39.55, 142.07), (39.27, 141.90), (39.02, 141.75), (38.88, 141.62),
    (38.67, 141.52), (38.50, 141.50), (38.28, 141.52), // Oshika Peninsula tip
    (38.41, 141.30), (38.32, 141.05), (38.26, 141.01), (38.08, 140.92), // Ishinomaki & Sendai Bay
    // Fukushima & Ibaraki (Joban -> Kashima-nada -> Inubosaki)
    (37.92, 140.94), (37.78, 140.98), (37.58, 141.02), (37.38, 141.03), (37.18, 141.00),
    (37.00, 140.98), (36.93, 140.90), (36.82, 140.79), (36.68, 140.71), (36.56, 140.65),
    (36.44, 140.61), (36.34, 140.60), (36.22, 140.59), (36.08, 140.63), (35.95, 140.69),
    (35.82, 140.79), (35.71, 140.87), (35.69, 140.85), // Choshi / Inubosaki
    // Kujukuri Beach & Outer Boso Peninsula
    (35.70, 140.73), (35.67, 140.62), (35.61, 140.51), (35.53, 140.45), (35.44, 140.40),
    (35.36, 140.39), (35.31, 140.41), // Taitozaki
    (35.24, 140.40), (35.18, 140.36), (35.14, 140.31), (35.12, 140.19), (35.08, 140.10),
    (35.02, 140.01), (34.95, 139.96), (34.90, 139.89), (34.91, 139.82), (34.97, 139.75), // Nojimazaki -> Sunosaki
    // Inner Boso & Tokyo Bay East Shore
    (34.99, 139.86), (35.04, 139.85), (35.10, 139.83), (35.17, 139.82), (35.24, 139.86),
    (35.28, 139.85), (35.31, 139.79), // Futtsu Cape!
    (35.32, 139.84), (35.35, 139.89), (35.39, 139.92), (35.45, 139.96), (35.52, 140.05),
    (35.60, 140.10), (35.65, 140.03), (35.67, 139.98), (35.63, 139.90), (35.64, 139.85),
    // Tokyo Bay West Shore -> Miura Peninsula
    (35.62, 139.79), (35.65, 139.76), (35.60, 139.76), (35.55, 139.79), // Takeshiba -> Haneda
    (35.50, 139.75), (35.47, 139.69), (35.45, 139.64), (35.42, 139.67), (35.39, 139.63), // Yokohama / Honmoku / Negishi
    (35.33, 139.64), (35.29, 139.67), (35.26, 139.75), // Yokosuka -> Kannonzaki
    (35.22, 139.72), (35.18, 139.68), (35.14, 139.68), (35.13, 139.62), // Kurihama -> Tsurugisaki -> Jogashima/Misaki
    (35.19, 139.60), (35.27, 139.57), (35.30, 139.55), // Hayama -> Kamakura
    // Sagami Bay -> Izu Peninsula
    (35.30, 139.48), (35.32, 139.40), (35.31, 139.33), (35.28, 139.22), (35.24, 139.15),
    (35.15, 139.15), (35.14, 139.11), (35.09, 139.08), (35.03, 139.09), (34.97, 139.11),
    (34.94, 139.15), (34.88, 139.13), (34.81, 139.07), (34.77, 139.05), (34.71, 138.99),
    (34.66, 138.99), (34.67, 138.94), (34.62, 138.89), (34.60, 138.85), // Shimoda -> Irozaki
    (34.64, 138.79), (34.69, 138.75), (34.76, 138.77), (34.84, 138.76), (34.91, 138.79),
    (34.98, 138.77), (35.03, 138.79), (35.02, 138.89), (35.09, 138.86), // West Izu -> Osezaki -> Numazu
    // Suruga Bay -> Omaezaki -> Enshu-nada -> Atsumi Peninsula
    (35.13, 138.74), (35.12, 138.63), (35.06, 138.53), (35.00, 138.53), (34.94, 138.42),
    (34.86, 138.33), (34.77, 138.29), (34.68, 138.22), (34.60, 138.23), // Omaezaki
    (34.63, 138.10), (34.66, 137.88), (34.66, 137.72), (34.68, 137.58), (34.66, 137.42),
    (34.62, 137.22), (34.58, 137.02), // Irago Cape (Atsumi Peninsula)
    // Mikawa Bay -> Chita Peninsula -> Ise Bay -> Shima -> Kii Peninsula
    (34.67, 137.24), (34.74, 137.33), (34.81, 137.22), (34.79, 137.08), (34.84, 136.96),
    (34.70, 136.97), (34.76, 136.85), (34.90, 136.83), (35.04, 136.85), // Chita -> Nagoya Port
    (35.03, 136.73), (34.95, 136.63), (34.82, 136.58), (34.69, 136.53), (34.58, 136.57),
    (34.51, 136.79), (34.47, 136.86), (34.37, 136.90), (34.27, 136.90), // Ise -> Toba -> Daiozaki
    (34.26, 136.75), (34.25, 136.54), (34.18, 136.34), (34.06, 136.20), (33.89, 136.11),
    (33.72, 136.00), (33.61, 135.94), (33.47, 135.84), (33.43, 135.76), // Shionomisaki
    (33.54, 135.49), (33.68, 135.34), (33.75, 135.36), (33.89, 135.07), (34.08, 135.10),
    (34.22, 135.14), (34.28, 135.07), // Wakayama / Kada
    // Osaka Bay -> Seto Inland Sea -> Shimonoseki
    (34.41, 135.31), (34.58, 135.45), (34.66, 135.43), (34.68, 135.19), (34.64, 134.99),
    (34.77, 134.66), (34.73, 134.40), (34.44, 133.91), (34.50, 133.74), (34.38, 133.38),
    (34.39, 133.08), (34.23, 132.55), (34.35, 132.45), (34.16, 132.23), (33.83, 132.12),
    (34.04, 131.57), (33.93, 131.25), (33.95, 130.94),
    // Sea of Japan Coast (San'in -> Tango/Wakasa -> Echizen -> Noto -> Toyama -> Niigata -> Oga -> Tsugaru)
    (34.35, 130.89), (34.43, 131.40), (34.69, 131.83), (34.91, 132.07), (35.43, 132.63),
    (35.56, 133.32), (35.45, 133.35), (35.54, 134.22), (35.65, 134.82), (35.78, 135.23),
    (35.54, 135.36), (35.50, 135.74), (35.67, 136.06), (35.98, 135.96), (36.24, 136.14),
    (36.58, 136.58), (36.82, 136.74), (37.08, 136.74), (37.28, 136.74), (37.40, 136.90),
    (37.49, 137.12), (37.53, 137.33), // Noto Peninsula tip (Rokugozaki)
    (37.35, 137.26), (37.30, 137.14), (37.22, 136.93), (37.13, 137.05), (37.05, 136.97),
    (37.09, 137.06), (36.86, 136.99), (36.76, 137.22), (36.82, 137.42), (36.95, 137.56), // Nanao Bay & Toyama Bay
    (37.05, 137.86), (37.18, 138.24), (37.38, 138.55), (37.65, 138.78), (37.95, 139.06), // Niigata
    (38.35, 139.45), (38.76, 139.73), (38.93, 139.82), (39.32, 139.96), (39.75, 140.06),
    (39.98, 139.70), (40.12, 139.98), (40.42, 140.02), (40.66, 139.93), (41.26, 140.34), // Oga -> Tappi
    (40.84, 140.75), (41.16, 141.12)
]

let shikokuLandRaw: [(Double, Double)] = [
    (34.23, 134.64), (34.04, 134.60), (33.84, 134.75), (33.58, 134.38), (33.25, 134.18), // Muroto
    (33.52, 133.82), (33.50, 133.56), (33.36, 133.28), (33.02, 133.02), (32.72, 133.02), // Ashizuri
    (32.85, 132.72), (33.18, 132.54), (33.34, 132.02), (33.52, 132.38), (33.86, 132.71), // Sadamisaki -> Matsuyama
    (34.07, 132.99), (33.98, 133.35), (34.01, 133.60), (34.26, 133.66), (34.33, 133.88),
    (34.35, 134.08), (34.26, 134.36)
]

let kyushuLandRaw: [(Double, Double)] = [
    (33.95, 130.97), (33.76, 131.02), (33.65, 131.58), (33.55, 131.74), (33.32, 131.50),
    (33.25, 131.88), (32.96, 131.95), (32.58, 131.68), (32.12, 131.52), (31.80, 131.44),
    (31.37, 131.34), (31.00, 130.68), (32.00, 130.20), (33.50, 129.85), (33.90, 130.65)
]

let awajiLandRaw: [(Double, Double)] = [
    (34.60, 135.02), (34.46, 134.95), (34.33, 134.90), (34.23, 134.72), (34.25, 134.65),
    (34.38, 134.76), (34.52, 134.89)
]

let sadoLandRaw: [(Double, Double)] = [
    (38.33, 138.52), (38.12, 138.45), (38.04, 138.54), (37.88, 138.46), (37.81, 138.26),
    (37.96, 138.22), (38.05, 138.34), (38.20, 138.34)
]

// Major Lakes for Authentic Atlas Look (Biwa-ko, Kasumigaura, Kitaura, Hamana-ko, Inawashiro-ko, Suwa-ko)
let lakeBiwaRaw: [(Double, Double)] = [
    (35.51, 136.14), (35.43, 136.22), (35.34, 136.27), (35.25, 136.19), (35.15, 136.06),
    (35.07, 135.94), (34.98, 135.90), (35.06, 135.87), (35.16, 135.91), (35.29, 136.00),
    (35.42, 136.02), (35.49, 136.07)
]

let lakeKasumigauraRaw: [(Double, Double)] = [
    (36.08, 140.21), (36.06, 140.29), (36.15, 140.33), (36.13, 140.38), (36.05, 140.41),
    (36.01, 140.49), (35.94, 140.56), (35.92, 140.50), (35.96, 140.39), (36.02, 140.31),
    (36.04, 140.22)
]

let lakeKitauraRaw: [(Double, Double)] = [
    (36.15, 140.54), (36.08, 140.57), (35.98, 140.60), (35.96, 140.57), (36.05, 140.53), (36.13, 140.51)
]

let lakeHamanaRaw: [(Double, Double)] = [
    (34.79, 137.62), (34.74, 137.64), (34.69, 137.60), (34.70, 137.54), (34.76, 137.52), (34.80, 137.56)
]

let lakeInawashiroRaw: [(Double, Double)] = [
    (37.53, 140.08), (37.48, 140.15), (37.41, 140.13), (37.42, 140.04), (37.49, 140.02)
]

let lakeSuwaRaw: [(Double, Double)] = [
    (36.07, 138.08), (36.05, 138.12), (36.02, 138.10), (36.04, 138.06)
]

// Gentle Chaikin corner-smoothing (0.18 / 0.82 preserves sharp capes while rounding artificial straight segments)
func smoothCoastline(_ pts: [(Double, Double)], iterations: Int = 1) -> [(Double, Double)] {
    guard pts.count >= 4 else { return pts }
    var cur = pts
    for _ in 0..<iterations {
        var next: [(Double, Double)] = []
        next.reserveCapacity(cur.count * 2)
        let n = cur.count
        for i in 0..<n {
            let p0 = cur[i]
            let p1 = cur[(i + 1) % n]
            next.append((p0.0 * 0.82 + p1.0 * 0.18, p0.1 * 0.82 + p1.1 * 0.18))
            next.append((p0.0 * 0.18 + p1.0 * 0.82, p0.1 * 0.18 + p1.1 * 0.82))
        }
        cur = next
    }
    return cur
}

let honshuLand = smoothCoastline(honshuLandRaw, iterations: 1)
let shikokuLand = smoothCoastline(shikokuLandRaw, iterations: 1)
let kyushuLand = smoothCoastline(kyushuLandRaw, iterations: 1)
let awajiLand = smoothCoastline(awajiLandRaw, iterations: 1)
let sadoLand = smoothCoastline(sadoLandRaw, iterations: 1)
let lakeBiwa = smoothCoastline(lakeBiwaRaw, iterations: 1)
let lakeKasumigaura = smoothCoastline(lakeKasumigauraRaw, iterations: 1)
let lakeKitaura = smoothCoastline(lakeKitauraRaw, iterations: 1)
let lakeHamana = smoothCoastline(lakeHamanaRaw, iterations: 1)
let lakeInawashiro = smoothCoastline(lakeInawashiroRaw, iterations: 1)
let lakeSuwa = smoothCoastline(lakeSuwaRaw, iterations: 1)

// Detailed island polygons (lat, lon) for Ogasawara Archipelago so zoomed view shows real archipelago shapes!
struct IslandPoly {
    let name: String
    let points: [(Double, Double)]
}

let detailedArchipelagoPolys: [IslandPoly] = [
    // Mukojima Retto (聟島列島)
    IslandPoly(name: "聟島", points: [
        (27.705, 142.125), (27.695, 142.155), (27.672, 142.152), (27.668, 142.130), (27.685, 142.118)
    ]),
    IslandPoly(name: "媒島", points: [
        (27.642, 142.172), (27.635, 142.188), (27.616, 142.184), (27.620, 142.168)
    ]),
    IslandPoly(name: "嫁島", points: [
        (27.512, 142.202), (27.504, 142.220), (27.488, 142.214), (27.495, 142.196)
    ]),
    IslandPoly(name: "北ノ島", points: [
        (27.728, 142.100), (27.722, 142.112), (27.714, 142.104)
    ]),

    // Chichijima Retto (父島列島)
    IslandPoly(name: "弟島", points: [
        (27.192, 142.182), (27.185, 142.204), (27.155, 142.202), (27.152, 142.180), (27.172, 142.174)
    ]),
    IslandPoly(name: "兄島", points: [
        (27.145, 142.190), (27.142, 142.222), (27.118, 142.230), (27.108, 142.205), (27.115, 142.186)
    ]),
    IslandPoly(name: "父島", points: [
        (27.102, 142.192), (27.100, 142.224), (27.078, 142.236), (27.048, 142.226),
        (27.038, 142.202), (27.052, 142.184), (27.074, 142.196), // Futami Bay indentation!
        (27.082, 142.184), (27.095, 142.184)
    ]),
    IslandPoly(name: "東島", points: [
        (27.100, 142.244), (27.094, 142.256), (27.084, 142.248)
    ]),
    IslandPoly(name: "西島", points: [
        (27.124, 142.164), (27.118, 142.176), (27.110, 142.166)
    ]),
    IslandPoly(name: "南島", points: [
        (27.044, 142.174), (27.038, 142.184), (27.030, 142.175)
    ]),

    // Hahajima Retto (母島列島)
    IslandPoly(name: "母島", points: [
        (26.718, 142.142), (26.705, 142.162), (26.675, 142.175), (26.645, 142.182),
        (26.612, 142.178), (26.605, 142.160), (26.632, 142.148), (26.668, 142.142), (26.695, 142.134)
    ]),
    IslandPoly(name: "向島", points: [
        (26.612, 142.126), (26.602, 142.138), (26.592, 142.128)
    ]),
    IslandPoly(name: "姉島", points: [
        (26.565, 142.152), (26.555, 142.166), (26.540, 142.158), (26.548, 142.146)
    ]),
    IslandPoly(name: "妹島", points: [
        (26.570, 142.204), (26.562, 142.218), (26.548, 142.210), (26.555, 142.198)
    ]),
    IslandPoly(name: "姪島", points: [
        (26.578, 142.226), (26.570, 142.238), (26.562, 142.228)
    ]),

    // Nishinoshima (西之島)
    IslandPoly(name: "西之島", points: [
        (27.262, 140.870), (27.258, 140.892), (27.238, 140.890), (27.240, 140.868)
    ])
]

struct TransitIsland {
    let name: String
    let sub: String
    let gp: GeoPoint
    let rxKm: Double
    let ryKm: Double
    let passProgress: Double // Route progress [0..1] when arrow passes this island
    let labelSide: Int // -1 = left, +1 = right
    let showInTransit: Bool
}

let transitIslands: [TransitIsland] = [
    TransitIsland(name: "伊豆大島", sub: "約120km", gp: GeoPoint(lat: 34.73, lon: 139.40), rxKm: 5.5, ryKm: 7.5, passProgress: 0.115, labelSide: -1, showInTransit: true),
    TransitIsland(name: "利島", sub: "", gp: GeoPoint(lat: 34.52, lon: 139.28), rxKm: 2.5, ryKm: 2.5, passProgress: 0.14, labelSide: -1, showInTransit: false),
    TransitIsland(name: "新島", sub: "", gp: GeoPoint(lat: 34.37, lon: 139.27), rxKm: 2.8, ryKm: 5.0, passProgress: 0.155, labelSide: -1, showInTransit: false),
    TransitIsland(name: "神津島", sub: "", gp: GeoPoint(lat: 34.21, lon: 139.15), rxKm: 3.2, ryKm: 4.0, passProgress: 0.17, labelSide: -1, showInTransit: false),
    TransitIsland(name: "三宅島", sub: "約180km", gp: GeoPoint(lat: 34.08, lon: 139.52), rxKm: 5.0, ryKm: 5.0, passProgress: 0.185, labelSide: -1, showInTransit: true),
    TransitIsland(name: "御蔵島", sub: "", gp: GeoPoint(lat: 33.87, lon: 139.60), rxKm: 3.2, ryKm: 3.2, passProgress: 0.21, labelSide: -1, showInTransit: false),
    TransitIsland(name: "八丈島", sub: "約290km", gp: GeoPoint(lat: 33.11, lon: 139.80), rxKm: 5.5, ryKm: 7.5, passProgress: 0.295, labelSide: -1, showInTransit: true),
    TransitIsland(name: "青ヶ島", sub: "約360km", gp: GeoPoint(lat: 32.45, lon: 139.76), rxKm: 3.5, ryKm: 4.2, passProgress: 0.368, labelSide: -1, showInTransit: true),
    TransitIsland(name: "須美寿島", sub: "", gp: GeoPoint(lat: 31.44, lon: 140.05), rxKm: 2.4, ryKm: 2.4, passProgress: 0.48, labelSide: -1, showInTransit: false),
    TransitIsland(name: "鳥島", sub: "約580km", gp: GeoPoint(lat: 30.48, lon: 140.30), rxKm: 4.2, ryKm: 4.2, passProgress: 0.585, labelSide: -1, showInTransit: true),
    TransitIsland(name: "孀婦岩", sub: "約650km", gp: GeoPoint(lat: 29.79, lon: 140.34), rxKm: 2.5, ryKm: 2.5, passProgress: 0.660, labelSide: -1, showInTransit: true)
]

// Ferry Route Control Points (Tokyo Bay -> Uraga -> East of Izu Islands -> Pacific -> West of Mukojima -> Chichijima Futami Port)
let routeWaypoints: [GeoPoint] = [
    GeoPoint(lat: 35.65, lon: 139.76), // Tokyo Bay (Takeshiba)
    GeoPoint(lat: 35.48, lon: 139.77),
    GeoPoint(lat: 35.16, lon: 139.78), // Uraga Channel exit
    GeoPoint(lat: 34.73, lon: 139.62), // Off Izu Oshima
    GeoPoint(lat: 34.08, lon: 139.74), // Off Miyakejima
    GeoPoint(lat: 33.11, lon: 139.98), // Off Hachijojima
    GeoPoint(lat: 32.45, lon: 140.02), // Off Aogashima
    GeoPoint(lat: 31.40, lon: 140.28),
    GeoPoint(lat: 30.48, lon: 140.54), // Off Torishima
    GeoPoint(lat: 29.50, lon: 140.92),
    GeoPoint(lat: 28.50, lon: 141.45),
    GeoPoint(lat: 27.70, lon: 141.94), // West of Mukojima Retto
    GeoPoint(lat: 27.26, lon: 142.10),
    GeoPoint(lat: 27.08, lon: 142.19)  // Chichijima (Futami Port)
]

// Precompute dense polyline along Catmull-Rom spline for smooth arc-length parameterization!
struct RouteSample {
    let wx: Double
    let wy: Double
    let distKm: Double
    let angle: Double
}

func catmullRom(_ p0: Double, _ p1: Double, _ p2: Double, _ p3: Double, _ t: Double) -> Double {
    let t2 = t * t
    let t3 = t2 * t
    return 0.5 * ((2.0 * p1) + (-p0 + p2) * t + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2 + (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3)
}

func buildDenseRoute() -> [RouteSample] {
    var pts: [(Double, Double)] = []
    let n = routeWaypoints.count
    let stepsPerSeg = 40
    for i in 0..<(n - 1) {
        let p0 = routeWaypoints[max(0, i - 1)]
        let p1 = routeWaypoints[i]
        let p2 = routeWaypoints[i + 1]
        let p3 = routeWaypoints[min(n - 1, i + 2)]
        for s in 0..<stepsPerSeg {
            let u = Double(s) / Double(stepsPerSeg)
            let x = catmullRom(p0.wx, p1.wx, p2.wx, p3.wx, u)
            let y = catmullRom(p0.wy, p1.wy, p2.wy, p3.wy, u)
            pts.append((x, y))
        }
    }
    pts.append((routeWaypoints.last!.wx, routeWaypoints.last!.wy))

    var cumDist: [Double] = [0.0]
    for i in 1..<pts.count {
        let dx = pts[i].0 - pts[i - 1].0
        let dy = pts[i].1 - pts[i - 1].1
        cumDist.append(cumDist.last! + hypot(dx, dy))
    }
    let rawTotal = cumDist.last!
    // Normalize displayed distance cleanly to 1,000 km (real ferry route distance Takeshiba <-> Chichijima is ~1,000 km)
    let scaleTo1000 = 1000.0 / rawTotal

    var samples: [RouteSample] = []
    for i in 0..<pts.count {
        let iPrev = max(0, i - 1)
        let iNext = min(pts.count - 1, i + 1)
        let ang = atan2(pts[iNext].1 - pts[iPrev].1, pts[iNext].0 - pts[iPrev].0)
        samples.append(RouteSample(wx: pts[i].0, wy: pts[i].1, distKm: cumDist[i] * scaleTo1000, angle: ang))
    }
    return samples
}

let ROUTE_SAMPLES = buildDenseRoute()

func sampleRoute(at frac: Double) -> (index: Int, sample: RouteSample) {
    let targetDist = clamp(frac) * 1000.0
    var idx = 0
    for i in 0..<ROUTE_SAMPLES.count {
        if ROUTE_SAMPLES[i].distKm <= targetDist {
            idx = i
        } else {
            break
        }
    }
    return (idx, ROUTE_SAMPLES[idx])
}

// MARK: - Typography & Drawing Primitives

func makeFont(size: Double, bold: Bool) -> CTFont {
    let name = bold ? "HiraginoSans-W6" : "HiraginoSans-W3"
    return CTFontCreateWithName(name as CFString, CGFloat(size), nil)
}

func makeHeavyFont(size: Double) -> CTFont {
    return CTFontCreateWithName("HiraginoSans-W7" as CFString, CGFloat(size), nil)
}

func measureText(_ text: String, font: CTFont, tracking: Double = 0.0) -> CGSize {
    let attrs: [NSAttributedString.Key: Any] = [
        NSAttributedString.Key(kCTFontAttributeName as String): font,
        NSAttributedString.Key(kCTKernAttributeName as String): NSNumber(value: tracking)
    ]
    let attrStr = NSAttributedString(string: text, attributes: attrs)
    let line = CTLineCreateWithAttributedString(attrStr)
    var ascent: CGFloat = 0
    var descent: CGFloat = 0
    var leading: CGFloat = 0
    let width = CTLineGetTypographicBounds(line, &ascent, &descent, &leading)
    return CGSize(width: width, height: ascent + descent)
}

enum TextAlign {
    case left, center, right
}

func drawText(
    _ ctx: CGContext,
    _ text: String,
    x: Double,
    y: Double, // Visual vertical center or top? Let's make y = vertical center of text cap/box for super predictable alignment!
    font: CTFont,
    color: CGColor,
    align: TextAlign = .left,
    tracking: Double = 0.0,
    strokeColor: CGColor? = nil,
    strokeWidth: Double = 0.0
) {
    let attrs: [NSAttributedString.Key: Any] = [
        NSAttributedString.Key(kCTFontAttributeName as String): font,
        NSAttributedString.Key(kCTForegroundColorAttributeName as String): color,
        NSAttributedString.Key(kCTKernAttributeName as String): NSNumber(value: tracking)
    ]
    let attrStr = NSAttributedString(string: text, attributes: attrs)
    let line = CTLineCreateWithAttributedString(attrStr)
    var ascent: CGFloat = 0
    var descent: CGFloat = 0
    var leading: CGFloat = 0
    let width = Double(CTLineGetTypographicBounds(line, &ascent, &descent, &leading))

    var drawX = x
    if align == .center { drawX = x - width * 0.5 }
    else if align == .right { drawX = x - width }

    // Baseline in top-down coordinates: center is y, height is ascent+descent -> baseline = y + (ascent - descent)/2
    let baselineY = y + Double(ascent - descent) * 0.5

    if let sCol = strokeColor, strokeWidth > 0 {
        ctx.saveGState()
        var strokeAttrs = attrs
        strokeAttrs[NSAttributedString.Key(kCTStrokeColorAttributeName as String)] = sCol
        strokeAttrs[NSAttributedString.Key(kCTStrokeWidthAttributeName as String)] = NSNumber(value: strokeWidth)
        let strokeLine = CTLineCreateWithAttributedString(NSAttributedString(string: text, attributes: strokeAttrs))
        ctx.textMatrix = CGAffineTransform(scaleX: 1.0, y: -1.0)
        ctx.textPosition = CGPoint(x: drawX, y: baselineY)
        CTLineDraw(strokeLine, ctx)
        ctx.restoreGState()
    }

    ctx.saveGState()
    ctx.textMatrix = CGAffineTransform(scaleX: 1.0, y: -1.0)
    ctx.textPosition = CGPoint(x: drawX, y: baselineY)
    CTLineDraw(line, ctx)
    ctx.restoreGState()
}

func fillRoundedRect(
    _ ctx: CGContext,
    rect: CGRect,
    radius: Double,
    fill: CGColor,
    stroke: CGColor? = nil,
    lineWidth: Double = 1.5,
    shadowAlpha: Double = 0.0,
    shadowBlur: Double = 16.0,
    shadowOffsetY: Double = 6.0
) {
    let path = CGPath(roundedRect: rect, cornerWidth: CGFloat(radius), cornerHeight: CGFloat(radius), transform: nil)
    ctx.saveGState()
    if shadowAlpha > 0 {
        ctx.setShadow(offset: CGSize(width: 0, height: -shadowOffsetY), blur: CGFloat(shadowBlur), color: rgba(15, 35, 60, shadowAlpha))
    }
    ctx.setFillColor(fill)
    ctx.addPath(path)
    ctx.fillPath()
    ctx.restoreGState()

    if let st = stroke {
        ctx.saveGState()
        ctx.setStrokeColor(st)
        ctx.setLineWidth(CGFloat(lineWidth))
        ctx.addPath(path)
        ctx.strokePath()
        ctx.restoreGState()
    }
}

// Note on CGContext shadow in flipped top-down context:
// Check shadow direction carefully when previewing PNG!

// MARK: - Camera Choreography

func cameraAtTime(_ t: Double) -> Camera {
    // Timeline Phases:
    // 0.0 - 2.8s: Hold on Kanto / Tokyo Bay (lat 35.1N, lon 139.65E, pxPerKm = 2.65)
    // 2.8 - 13.8s: Follow ferry route southward to Chichijima while keeping surrounding islands clear
    // 13.8 - 15.0s: Arrive at Chichijima (hold briefly at medium scale)
    // 15.0 - 18.4s: Smooth zoom into Ogasawara Archipelago (Mukojima + Chichijima + Hahajima + Nishinoshima)
    //               shifted gracefully to right-center so Left Overview Route Panel fits cleanly without overlap!
    // 18.4 - 24.0s: Gentle archipelago showcase hold

    let startGP = GeoPoint(lat: 35.42, lon: 138.95)
    let routeFrac = easeInOutCubic(progress(t, 2.6, 13.8))
    let (_, curSample) = sampleRoute(at: routeFrac)

    // Camera during voyage: start wide enough to show iconic Honshu (Noto, Ise Bay, Izu, Tokyo Bay, Boso, Choshi), then track smoothly south!
    let followBlend = easeInOutCubic(progress(t, 2.6, 5.2))
    let midOceanZoomOut = sin( clamp(progress(t, 3.0, 13.5)) * Double.pi ) // 0 -> 1 -> 0

    let voyageWX = lerp(startGP.wx, curSample.wx - 25.0, followBlend)
    let voyageWY = lerp(startGP.wy, curSample.wy - 20.0, followBlend)
    let voyageScale = lerp(1.72, 1.52, midOceanZoomOut * 0.85 + followBlend * 0.15)
    let voyageScreenX = lerp(W * 0.60, W * 0.58, followBlend)
    let voyageScreenY = H * 0.52

    // Zoomed Archipelago Target Camera (15.0s -> 18.4s):
    // Center around 27.12°N, 141.78°E so Nishinoshima (140.88°E) AND Mukojima/Chichijima/Hahajima (27.7°N..26.5°N, 142.2°E) fit beautifully on the right 66% of the screen!
    let archCenter = GeoPoint(lat: 27.12, lon: 141.72)
    let archScale = 4.35 // ~185km tall span = ~805px on 1080p! Huge, detailed islands!
    let archScreenX = W * 0.65
    let archScreenY = H * 0.55

    let zoomT = easeInOutCubic(progress(t, 15.0, 18.4))
    // Subtle slow drift during 18.4 - 24.0s so image feels alive
    let postDrift = progress(t, 18.4, 24.0) * 0.12

    return Camera(
        centerWX: lerp(voyageWX, archCenter.wx, zoomT),
        centerWY: lerp(voyageWY, archCenter.wy, zoomT),
        pxPerKm: lerp(voyageScale, archScale + postDrift, zoomT),
        screenCenterX: lerp(voyageScreenX, archScreenX, zoomT),
        screenCenterY: lerp(voyageScreenY, archScreenY, zoomT)
    )
}

// MARK: - Main Frame Renderer

func renderFrame(_ ctx: CGContext, time t: Double) {
    let cam = cameraAtTime(t)
    let routeFrac = easeInOutCubic(progress(t, 2.6, 13.8))
    let (routeIdx, curSample) = sampleRoute(at: routeFrac)
    let archZoom = easeInOutCubic(progress(t, 15.0, 18.4))

    // 1. Luminous Cartographic Ocean Background Gradient
    let colorSpace = CGColorSpace(name: CGColorSpace.sRGB)!
    let oceanGrad = CGGradient(
        colorsSpace: colorSpace,
        colors: [
            rgba(214, 238, 250, 1.0), // Bright coastal sky-blue top
            rgba(182, 221, 243, 1.0), // Clear Pacific azure middle
            rgba(154, 205, 235, 1.0)  // Deeper subtropical blue bottom
        ] as CFArray,
        locations: [0.0, 0.55, 1.0]
    )!
    ctx.drawLinearGradient(oceanGrad, start: CGPoint(x: W * 0.5, y: 0), end: CGPoint(x: W * 0.5, y: H), options: [])

    // 2. Subtle Latitude & Longitude Grid Lines (Pure Atlas Feel)
    let fontGrid = makeFont(size: 16, bold: false)
    ctx.saveGState()
    ctx.setStrokeColor(rgba(255, 255, 255, 0.42))
    ctx.setLineWidth(1.2)
    ctx.setLineDash(phase: 0, lengths: [6, 6])

    for latDeg in stride(from: 25, through: 38, by: 1) {
        let pL = cam.toScreen(GeoPoint(lat: Double(latDeg), lon: 132.0))
        let pR = cam.toScreen(GeoPoint(lat: Double(latDeg), lon: 146.0))
        if pL.y > -40 && pL.y < H + 40 {
            ctx.move(to: CGPoint(x: 0, y: pL.y))
            ctx.addLine(to: CGPoint(x: W, y: pR.y))
            ctx.strokePath()
            if pL.y > 145 && pL.y < H - 95 {
                drawText(ctx, "\(latDeg)°N", x: W - 18, y: Double(pL.y) - 12, font: fontGrid, color: rgba(45, 95, 130, 0.65), align: .right)
            }
        }
    }
    for lonDeg in stride(from: 135, through: 145, by: 1) {
        let pT = cam.toScreen(GeoPoint(lat: 41.0, lon: Double(lonDeg)))
        let pB = cam.toScreen(GeoPoint(lat: 24.0, lon: Double(lonDeg)))
        if pT.x > -40 && pT.x < W + 40 {
            ctx.move(to: CGPoint(x: pT.x, y: 0))
            ctx.addLine(to: CGPoint(x: pB.x, y: H))
            ctx.strokePath()
            if pB.x > 460 && pB.x < W - 260 {
                drawText(ctx, "\(lonDeg)°E", x: Double(pB.x) + 6, y: H - 20, font: fontGrid, color: rgba(45, 95, 130, 0.65), align: .left)
            }
        }
    }
    ctx.restoreGState()

    // 3. Shallow Coastal Reef / Shelf Halos around Honshu & Islands
    func buildGeoPath(_ coords: [(Double, Double)]) -> CGPath {
        let path = CGMutablePath()
        for (i, c) in coords.enumerated() {
            let pt = cam.toScreen(GeoPoint(lat: c.0, lon: c.1))
            if i == 0 { path.move(to: pt) }
            else { path.addLine(to: pt) }
        }
        path.closeSubpath()
        return path
    }

    let landMassPaths = [
        buildGeoPath(honshuLand),
        buildGeoPath(shikokuLand),
        buildGeoPath(kyushuLand),
        buildGeoPath(awajiLand),
        buildGeoPath(sadoLand)
    ]
    let lakePaths = [
        buildGeoPath(lakeBiwa),
        buildGeoPath(lakeKasumigaura),
        buildGeoPath(lakeKitaura),
        buildGeoPath(lakeHamana),
        buildGeoPath(lakeInawashiro),
        buildGeoPath(lakeSuwa)
    ]

    // Coastal shallow turquoise glow around Japan landmasses
    ctx.saveGState()
    ctx.setStrokeColor(rgba(225, 246, 252, 0.75))
    ctx.setLineWidth(CGFloat(max(9.0, 9.0 * cam.pxPerKm / 2.2)))
    ctx.setLineJoin(.round)
    for lp in landMassPaths { ctx.addPath(lp) }
    ctx.strokePath()
    ctx.restoreGState()

    // Draw Honshu, Shikoku, Kyushu, Awaji, Sado Landmasses (Warm Atlas Ivory-Sand with gentle green-gray coastline)
    for landPath in landMassPaths {
        ctx.saveGState()
        ctx.setFillColor(rgba(244, 240, 224, 1.0))
        ctx.addPath(landPath)
        ctx.fillPath()
        ctx.setStrokeColor(rgba(115, 138, 122, 0.95))
        ctx.setLineWidth(1.9)
        ctx.setLineJoin(.round)
        ctx.addPath(landPath)
        ctx.strokePath()
        ctx.restoreGState()
    }

    // Draw major lakes (Lake Biwa, Kasumigaura, Lake Hamana)
    for lkPath in lakePaths {
        ctx.saveGState()
        ctx.setFillColor(rgba(196, 229, 246, 1.0))
        ctx.addPath(lkPath)
        ctx.fillPath()
        ctx.setStrokeColor(rgba(118, 152, 168, 0.75))
        ctx.setLineWidth(1.2)
        ctx.setLineJoin(.round)
        ctx.addPath(lkPath)
        ctx.strokePath()
        ctx.restoreGState()
    }

    // Geographic labels on Honshu (fade softly when far south)
    let honshuPos = cam.toScreen(GeoPoint(lat: 36.32, lon: 137.98))
    if honshuPos.y > -200 && honshuPos.y < H + 100 {
        drawText(ctx, "本 州", x: Double(honshuPos.x), y: Double(honshuPos.y), font: makeFont(size: 26, bold: true), color: rgba(90, 102, 95, 0.75), align: .center, tracking: 8.0)

        // Mt. Fuji landmark for intuitive orientation
        let fujiPt = cam.toScreen(GeoPoint(lat: 35.36, lon: 138.73))
        ctx.saveGState()
        let fPath = CGMutablePath()
        fPath.move(to: CGPoint(x: fujiPt.x - 11, y: fujiPt.y + 8))
        fPath.addLine(to: CGPoint(x: fujiPt.x, y: fujiPt.y - 10))
        fPath.addLine(to: CGPoint(x: fujiPt.x + 11, y: fujiPt.y + 8))
        fPath.closeSubpath()
        ctx.setFillColor(rgba(120, 150, 185, 0.85))
        ctx.addPath(fPath)
        ctx.fillPath()
        ctx.restoreGState()
        drawText(ctx, "富士山", x: Double(fujiPt.x), y: Double(fujiPt.y) + 21, font: makeFont(size: 16, bold: true), color: rgba(75, 90, 105, 0.85), align: .center)

        let izuPenPt = cam.toScreen(GeoPoint(lat: 34.97, lon: 138.93))
        drawText(ctx, "伊豆半島", x: Double(izuPenPt.x), y: Double(izuPenPt.y), font: makeFont(size: 13.0, bold: true), color: rgba(85, 100, 95, 0.82), align: .center, strokeColor: rgba(244, 240, 224, 0.85), strokeWidth: 3.0)

        let bosoPt = cam.toScreen(GeoPoint(lat: 35.24, lon: 140.16))
        drawText(ctx, "房総半島", x: Double(bosoPt.x), y: Double(bosoPt.y), font: makeFont(size: 13.5, bold: true), color: rgba(85, 100, 95, 0.82), align: .center, strokeColor: rgba(244, 240, 224, 0.85), strokeWidth: 3.0)
    }

    // 4. Draw Transit Islands (Izu Islands -> Nanpo Islands)
    for isl in transitIslands {
        let pt = cam.toScreen(isl.gp)
        guard pt.y > -80 && pt.y < H + 80 && pt.x > -80 && pt.x < W + 80 else { continue }

        let rx = max(5.5, isl.rxKm * cam.pxPerKm * 0.95)
        let ry = max(5.5, isl.ryKm * cam.pxPerKm * 0.95)

        // Coral / shallow shelf halo
        let haloRect = CGRect(x: Double(pt.x) - rx - 6, y: Double(pt.y) - ry - 6, width: (rx + 6) * 2, height: (ry + 6) * 2)
        ctx.saveGState()
        ctx.setFillColor(rgba(210, 245, 248, 0.65))
        ctx.fillEllipse(in: haloRect)

        // Gentle ripple when ferry arrow passes this island
        if isl.showInTransit && routeFrac >= isl.passProgress {
            let sincePass = progress(routeFrac, isl.passProgress, min(1.0, isl.passProgress + 0.14))
            if sincePass < 1.0 {
                let ringR = max(rx, ry) + 8.0 + sincePass * 36.0
                ctx.setStrokeColor(rgba(230, 95, 60, (1.0 - sincePass) * 0.75))
                ctx.setLineWidth(2.5)
                ctx.strokeEllipse(in: CGRect(x: Double(pt.x) - ringR, y: Double(pt.y) - ringR, width: ringR * 2, height: ringR * 2))
            }
        }

        // Island body (lush green-ivory)
        let bodyRect = CGRect(x: Double(pt.x) - rx, y: Double(pt.y) - ry, width: rx * 2, height: ry * 2)
        ctx.setFillColor(rgba(205, 232, 185, 1.0))
        ctx.fillEllipse(in: bodyRect)
        ctx.setStrokeColor(rgba(52, 118, 72, 0.95))
        ctx.setLineWidth(2.0)
        ctx.strokeEllipse(in: bodyRect)
        ctx.restoreGState()

        if isl.showInTransit && !(Double(pt.y) > H - 118.0 && t < 18.2) {
            let passed = routeFrac >= isl.passProgress - 0.03
            let labelAlpha = passed ? 1.0 : 0.78
            let fontName = makeFont(size: passed ? 21 : 18, bold: true)
            let offsetX = Double(isl.labelSide) * (rx + 14.0)
            let align: TextAlign = isl.labelSide < 0 ? .right : .left
            drawText(
                ctx, isl.name,
                x: Double(pt.x) + offsetX,
                y: Double(pt.y) - (isl.sub.isEmpty ? 0 : 8),
                font: fontName,
                color: rgba(24, 42, 62, labelAlpha),
                align: align,
                strokeColor: rgba(255, 255, 255, 0.92 * labelAlpha),
                strokeWidth: 4.5
            )
            if !isl.sub.isEmpty && passed {
                let subAlpha = clamp((routeFrac - (isl.passProgress - 0.02)) / 0.05)
                drawText(
                    ctx, "東京から\(isl.sub)",
                    x: Double(pt.x) + offsetX,
                    y: Double(pt.y) + 14,
                    font: makeFont(size: 14, bold: true),
                    color: rgba(45, 95, 138, 0.92 * subAlpha),
                    align: align,
                    strokeColor: rgba(255, 255, 255, 0.90 * subAlpha),
                    strokeWidth: 4.0
                )
            }
        }
    }

    // 5. Draw Ogasawara Archipelago Islands (Coral Lagoon Halo + Detailed Archipelago Polygons!)
    // First draw turquoise lagoon halos around each island group so "Bonin Blue" & archipelago cluster stands out!
    let groupCenters: [(GeoPoint, Double, Double, String, String)] = [
        (GeoPoint(lat: 27.61, lon: 142.16), 14.0, 26.0, "聟島列島", "（聟島・媒島・嫁島など）"),
        (GeoPoint(lat: 27.11, lon: 142.20), 18.0, 26.0, "父島列島", "（父島・兄島・弟島など）"),
        (GeoPoint(lat: 26.63, lon: 142.17), 16.0, 28.0, "母島列島", "（母島・姉島・妹島など）")
    ]

    for (gp, rxKm, ryKm, _, _) in groupCenters {
        let c = cam.toScreen(gp)
        let rx = max(14.0, rxKm * cam.pxPerKm)
        let ry = max(20.0, ryKm * cam.pxPerKm)
        ctx.saveGState()
        ctx.setFillColor(rgba(165, 235, 242, 0.48))
        ctx.fillEllipse(in: CGRect(x: Double(c.x) - rx, y: Double(c.y) - ry, width: rx * 2, height: ry * 2))
        ctx.restoreGState()
    }

    // Draw each detailed archipelago island polygon (plus minimum screen size visibility when zoomed out)
    for poly in detailedArchipelagoPolys {
        let pPath = buildGeoPath(poly.points)
        // Compute centroid for small-scale visibility boost when zoomed out
        var sumLat = 0.0, sumLon = 0.0
        for p in poly.points { sumLat += p.0; sumLon += p.1 }
        let cGP = GeoPoint(lat: sumLat / Double(poly.points.count), lon: sumLon / Double(poly.points.count))
        let cPt = cam.toScreen(cGP)

        ctx.saveGState()
        // Shallow reef rim
        ctx.setStrokeColor(rgba(195, 248, 250, 0.80))
        ctx.setLineWidth(CGFloat(4.0 + archZoom * 5.0))
        ctx.setLineJoin(.round)
        ctx.addPath(pPath)
        ctx.strokePath()

        // Lush island fill
        let isMain = (poly.name == "父島" || poly.name == "母島")
        ctx.setFillColor(isMain ? rgba(182, 224, 152, 1.0) : rgba(198, 230, 174, 1.0))
        ctx.addPath(pPath)
        ctx.fillPath()

        ctx.setStrokeColor(isMain ? rgba(32, 105, 58, 1.0) : rgba(48, 118, 68, 0.95))
        ctx.setLineWidth(isMain ? 2.4 : 1.8)
        ctx.setLineJoin(.round)
        ctx.addPath(pPath)
        ctx.strokePath()

        // When zoomed out before 15.5s, ensure Chichijima, Hahajima, Mukojima, Nishinoshima remain clearly visible
        if archZoom < 0.5 && (poly.name == "父島" || poly.name == "母島" || poly.name == "聟島" || poly.name == "西之島") {
            let r = (poly.name == "父島") ? 6.5 : 5.0
            let fade = 1.0 - archZoom * 2.0
            ctx.setFillColor(rgba(182, 224, 152, fade))
            ctx.fillEllipse(in: CGRect(x: Double(cPt.x) - r, y: Double(cPt.y) - r, width: r * 2, height: r * 2))
            ctx.setStrokeColor(rgba(32, 105, 58, fade))
            ctx.setLineWidth(1.8)
            ctx.strokeEllipse(in: CGRect(x: Double(cPt.x) - r, y: Double(cPt.y) - r, width: r * 2, height: r * 2))
        }
        ctx.restoreGState()
    }

    // Also Kita-Iwojima in far south when visible and clear of bottom UI bar
    let kitaIwo = cam.toScreen(GeoPoint(lat: 25.43, lon: 141.28))
    if kitaIwo.y < H - 125 {
        ctx.saveGState()
        ctx.setFillColor(rgba(198, 230, 174, 1.0))
        ctx.fillEllipse(in: CGRect(x: Double(kitaIwo.x) - 5, y: Double(kitaIwo.y) - 5, width: 10, height: 10))
        ctx.setStrokeColor(rgba(48, 118, 68, 0.9))
        ctx.setLineWidth(1.6)
        ctx.strokeEllipse(in: CGRect(x: Double(kitaIwo.x) - 5, y: Double(kitaIwo.y) - 5, width: 10, height: 10))
        ctx.restoreGState()
        drawText(ctx, "北硫黄島（火山列島）", x: Double(kitaIwo.x) + 12, y: Double(kitaIwo.y), font: makeFont(size: 15, bold: false), color: rgba(45, 75, 95, 0.80), align: .left, strokeColor: rgba(255, 255, 255, 0.85), strokeWidth: 3.5)
    }

    // 6. Draw Animated Ferry Route Arrow (Tokyo Bay -> Chichijima)
    if t >= 2.4 {
        let routeAppear = clamp((t - 2.4) / 0.4)
        let maxIdx = max(1, routeIdx)

        let routePath = CGMutablePath()
        for i in 0...maxIdx {
            let s = ROUTE_SAMPLES[i]
            let pt = cam.toScreenXY(s.wx, s.wy)
            if i == 0 { routePath.move(to: pt) }
            else { routePath.addLine(to: pt) }
        }

        // White outer casing for crisp legibility over ocean & islands
        ctx.saveGState()
        ctx.setStrokeColor(rgba(255, 255, 255, 0.95 * routeAppear))
        ctx.setLineWidth(13.0)
        ctx.setLineCap(.round)
        ctx.setLineJoin(.round)
        ctx.addPath(routePath)
        ctx.strokePath()

        // Warm Coral-Vermilion Route Line
        ctx.setStrokeColor(rgba(228, 78, 52, 0.98 * routeAppear))
        ctx.setLineWidth(7.5)
        ctx.setLineCap(.round)
        ctx.setLineJoin(.round)
        ctx.addPath(routePath)
        ctx.strokePath()
        ctx.restoreGState()

        // Distance milestone ticks along the route (200km, 400km, 600km, 800km) during voyage
        let milestoneFade = 1.0 - archZoom
        if milestoneFade > 0.05 {
            for kmMark in [200.0, 400.0, 600.0, 800.0] {
                if curSample.distKm >= kmMark + 15.0 {
                    let (_, mSample) = sampleRoute(at: kmMark / 1000.0)
                    let mPt = cam.toScreenXY(mSample.wx, mSample.wy)
                    if mPt.y > 60 && mPt.y < H - 60 {
                        ctx.saveGState()
                        ctx.setFillColor(rgba(255, 255, 255, 0.95 * milestoneFade))
                        ctx.fillEllipse(in: CGRect(x: Double(mPt.x) - 5.5, y: Double(mPt.y) - 5.5, width: 11, height: 11))
                        ctx.setStrokeColor(rgba(228, 78, 52, 0.95 * milestoneFade))
                        ctx.setLineWidth(2.2)
                        ctx.strokeEllipse(in: CGRect(x: Double(mPt.x) - 5.5, y: Double(mPt.y) - 5.5, width: 11, height: 11))
                        ctx.restoreGState()

                        drawText(
                            ctx, "\(Int(kmMark))km",
                            x: Double(mPt.x) + 16,
                            y: Double(mPt.y),
                            font: makeFont(size: 16, bold: true),
                            color: rgba(195, 58, 36, 0.90 * milestoneFade),
                            align: .left,
                            strokeColor: rgba(255, 255, 255, 0.92 * milestoneFade),
                            strokeWidth: 4.0
                        )
                    }
                }
            }
        }

        // Leading Arrowhead at current tip!
        let tipPt = cam.toScreenXY(curSample.wx, curSample.wy)
        // Compute screen-space tangent angle near tip
        let prevIdx = max(0, maxIdx - 6)
        let prevPt = cam.toScreenXY(ROUTE_SAMPLES[prevIdx].wx, ROUTE_SAMPLES[prevIdx].wy)
        let screenAng = (maxIdx > 2) ? atan2(Double(tipPt.y - prevPt.y), Double(tipPt.x - prevPt.x)) : (Double.pi * 0.5)

        ctx.saveGState()
        ctx.translateBy(x: tipPt.x, y: tipPt.y)
        ctx.rotate(by: CGFloat(screenAng))

        let arrowHead = CGMutablePath()
        arrowHead.move(to: CGPoint(x: 16, y: 0))
        arrowHead.addLine(to: CGPoint(x: -13, y: -13))
        arrowHead.addLine(to: CGPoint(x: -7, y: 0))
        arrowHead.addLine(to: CGPoint(x: -13, y: 13))
        arrowHead.closeSubpath()

        ctx.setStrokeColor(rgba(255, 255, 255, 0.98 * routeAppear))
        ctx.setLineWidth(5.5)
        ctx.setLineJoin(.round)
        ctx.addPath(arrowHead)
        ctx.strokePath()

        ctx.setFillColor(rgba(228, 78, 52, 1.0 * routeAppear))
        ctx.addPath(arrowHead)
        ctx.fillPath()
        ctx.restoreGState()
    }

    // 7. Tokyo Bay Departure Marker & Callout (Scene 1 & early Scene 2)
    let tokyoPt = cam.toScreen(GeoPoint(lat: 35.65, lon: 139.76))
    if tokyoPt.y > -80 && tokyoPt.y < H + 80 {
        let pinPop = easeOutBack(progress(t, 0.4, 1.1))
        if pinPop > 0.01 {
            // Pulse ring around Tokyo Bay
            let pulse = (sin(t * 4.0) * 0.5 + 0.5)
            let pR = (14.0 + pulse * 10.0) * pinPop
            ctx.saveGState()
            ctx.setFillColor(rgba(228, 78, 52, 0.22))
            ctx.fillEllipse(in: CGRect(x: Double(tokyoPt.x) - pR, y: Double(tokyoPt.y) - pR, width: pR * 2, height: pR * 2))

            let dotR = 8.5 * pinPop
            ctx.setFillColor(rgba(228, 78, 52, 1.0))
            ctx.fillEllipse(in: CGRect(x: Double(tokyoPt.x) - dotR, y: Double(tokyoPt.y) - dotR, width: dotR * 2, height: dotR * 2))
            ctx.setStrokeColor(rgba(255, 255, 255, 1.0))
            ctx.setLineWidth(3.0)
            ctx.strokeEllipse(in: CGRect(x: Double(tokyoPt.x) - dotR, y: Double(tokyoPt.y) - dotR, width: dotR * 2, height: dotR * 2))
            ctx.restoreGState()

            // Callout pill placed cleanly up-left over inland Kanto so Tokyo Bay, Chiba, Boso & Choshi coastlines remain 100% unobstructed!
            let boxW = 240.0
            let boxH = 68.0
            let bx = Double(tokyoPt.x) - boxW - 26.0
            let by = Double(tokyoPt.y) - boxH - 16.0

            ctx.saveGState()
            ctx.setStrokeColor(rgba(228, 78, 52, 0.90 * clamp(pinPop)))
            ctx.setLineWidth(2.4)
            ctx.move(to: CGPoint(x: bx + boxW - 14, y: by + boxH))
            ctx.addLine(to: CGPoint(x: Double(tokyoPt.x) - 6, y: Double(tokyoPt.y) - 5))
            ctx.strokePath()
            ctx.restoreGState()

            fillRoundedRect(
                ctx,
                rect: CGRect(x: bx, y: by, width: boxW, height: boxH),
                radius: 14,
                fill: rgba(255, 255, 255, 0.95 * clamp(pinPop)),
                stroke: rgba(228, 78, 52, 0.85 * clamp(pinPop)),
                lineWidth: 2.2,
                shadowAlpha: 0.14 * clamp(pinPop)
            )
            drawText(ctx, "出発：東京湾", x: bx + 18, y: by + 24, font: makeHeavyFont(size: 22), color: rgba(205, 58, 35, clamp(pinPop)), align: .left)
            drawText(ctx, "東京都港区 竹芝ふ頭", x: bx + 18, y: by + 50, font: makeFont(size: 14, bold: true), color: rgba(85, 100, 118, clamp(pinPop)), align: .left)
        }
    }

    // 8. Chichijima Arrival Marker & Archipelago Group Annotations (Scene 3 & 4: t >= 13.6s)
    if t >= 13.6 {
        let chichiGP = GeoPoint(lat: 27.08, lon: 142.19)
        let chichiPt = cam.toScreen(chichiGP)
        let arrPop = easeOutBack(progress(t, 13.6, 14.3))

        // Expanding celebratory arrival rings
        let ringT = progress(t, 13.6, 15.2)
        if ringT < 1.0 {
            let r1 = 12.0 + ringT * 58.0
            ctx.saveGState()
            ctx.setStrokeColor(rgba(228, 78, 52, (1.0 - ringT) * 0.85))
            ctx.setLineWidth(3.0)
            ctx.strokeEllipse(in: CGRect(x: Double(chichiPt.x) - r1, y: Double(chichiPt.y) - r1, width: r1 * 2, height: r1 * 2))
            ctx.restoreGState()
        }

        // Harbor pin on Chichijima (Futami Port)
        let dotR = 8.0 * clamp(arrPop)
        ctx.saveGState()
        ctx.setFillColor(rgba(228, 78, 52, 1.0))
        ctx.fillEllipse(in: CGRect(x: Double(chichiPt.x) - dotR, y: Double(chichiPt.y) - dotR, width: dotR * 2, height: dotR * 2))
        ctx.setStrokeColor(rgba(255, 255, 255, 1.0))
        ctx.setLineWidth(2.8)
        ctx.strokeEllipse(in: CGRect(x: Double(chichiPt.x) - dotR, y: Double(chichiPt.y) - dotR, width: dotR * 2, height: dotR * 2))
        ctx.restoreGState()

        // Before zoom completes, show crisp "父島" arrival label; as zoom completes, transition smoothly into rich archipelago labels!
        if archZoom < 0.85 {
            let preFade = (1.0 - archZoom / 0.85) * clamp(arrPop)
            drawText(
                ctx, "到着：父島",
                x: Double(chichiPt.x) + 20,
                y: Double(chichiPt.y) - 4,
                font: makeHeavyFont(size: 26),
                color: rgba(195, 48, 28, preFade),
                align: .left,
                strokeColor: rgba(255, 255, 255, 0.96 * preFade),
                strokeWidth: 5.0
            )
        }
    }

    // Detailed Archipelago Labels & Dashed Cluster Rings (16.4s -> 24.0s)
    if t >= 16.2 {
        let clusterAlpha = easeOutCubic(progress(t, 16.2, 17.8))

        // Soft dashed grouping loops around the 3 island chains (聟島列島, 父島列島, 母島列島) + archipelago big bracket
        for (gp, rxKm, ryKm, groupTitle, groupSub) in groupCenters {
            let c = cam.toScreen(gp)
            let rx = rxKm * cam.pxPerKm * 1.15
            let ry = ryKm * cam.pxPerKm * 1.08

            ctx.saveGState()
            ctx.setStrokeColor(rgba(22, 112, 155, 0.55 * clusterAlpha))
            ctx.setLineWidth(2.0)
            ctx.setLineDash(phase: 0, lengths: [7, 5])
            ctx.strokeEllipse(in: CGRect(x: Double(c.x) - rx, y: Double(c.y) - ry, width: rx * 2, height: ry * 2))
            ctx.restoreGState()

            // Group label to the right of each island chain!
            let lx = Double(c.x) + rx + 18.0
            let ly = Double(c.y)
            drawText(
                ctx, groupTitle,
                x: lx, y: ly - 11,
                font: makeHeavyFont(size: 22),
                color: rgba(18, 65, 98, clusterAlpha),
                align: .left,
                strokeColor: rgba(255, 255, 255, 0.95 * clusterAlpha),
                strokeWidth: 4.5
            )
            drawText(
                ctx, groupSub,
                x: lx, y: ly + 14,
                font: makeFont(size: 15, bold: true),
                color: rgba(48, 92, 122, clusterAlpha),
                align: .left,
                strokeColor: rgba(255, 255, 255, 0.92 * clusterAlpha),
                strokeWidth: 4.0
            )
        }

        // Individual island labels inside 父島列島 & 母島列島 & 西之島!
        let chichiMainPt = cam.toScreen(GeoPoint(lat: 27.065, lon: 142.21))
        // Highlight callout badge pointing to 父島 (left side of 父島 so it doesn't collide with right-side 父島列島 label!)
        let cbW = 248.0
        let cbH = 72.0
        let cbx = Double(chichiMainPt.x) - cbW - 38.0
        let cby = Double(chichiMainPt.y) - cbH * 0.5 + 8.0

        // Leader line from callout to Chichijima
        ctx.saveGState()
        ctx.setStrokeColor(rgba(228, 78, 52, 0.9 * clusterAlpha))
        ctx.setLineWidth(2.5)
        ctx.move(to: CGPoint(x: cbx + cbW, y: cby + cbH * 0.5))
        ctx.addLine(to: CGPoint(x: Double(chichiMainPt.x) - 10, y: Double(chichiMainPt.y)))
        ctx.strokePath()
        ctx.restoreGState()

        fillRoundedRect(
            ctx,
            rect: CGRect(x: cbx, y: cby, width: cbW, height: cbH),
            radius: 13,
            fill: rgba(255, 255, 255, 0.96 * clusterAlpha),
            stroke: rgba(228, 78, 52, 0.90 * clusterAlpha),
            lineWidth: 2.4,
            shadowAlpha: 0.15 * clusterAlpha
        )
        drawText(ctx, "父島（ちちじま）", x: cbx + 16, y: cby + 24, font: makeHeavyFont(size: 22), color: rgba(202, 52, 32, clusterAlpha), align: .left)
        drawText(ctx, "定期船の発着港がある中心の島", x: cbx + 16, y: cby + 50, font: makeFont(size: 14.5, bold: true), color: rgba(65, 82, 98, clusterAlpha), align: .left)

        // Sub-islands of Mukojima Retto, Chichijima Retto, Hahajima Retto (placed clear of the route line!)
        let mukoSubPt = cam.toScreen(GeoPoint(lat: 27.685, lon: 142.14))
        drawText(ctx, "聟島", x: Double(mukoSubPt.x) + 13, y: Double(mukoSubPt.y) - 2, font: makeFont(size: 14.5, bold: true), color: rgba(30, 68, 52, clusterAlpha), align: .left, strokeColor: rgba(255, 255, 255, 0.92 * clusterAlpha), strokeWidth: 3.5)

        let yomeSubPt = cam.toScreen(GeoPoint(lat: 27.50, lon: 142.21))
        drawText(ctx, "嫁島", x: Double(yomeSubPt.x) + 11, y: Double(yomeSubPt.y), font: makeFont(size: 14, bold: true), color: rgba(30, 68, 52, clusterAlpha), align: .left, strokeColor: rgba(255, 255, 255, 0.92 * clusterAlpha), strokeWidth: 3.5)

        let ototoPt = cam.toScreen(GeoPoint(lat: 27.175, lon: 142.195))
        drawText(ctx, "弟島", x: Double(ototoPt.x) + 13, y: Double(ototoPt.y) - 3, font: makeFont(size: 15, bold: true), color: rgba(30, 68, 52, clusterAlpha), align: .left, strokeColor: rgba(255, 255, 255, 0.94 * clusterAlpha), strokeWidth: 3.8)

        let aniPt = cam.toScreen(GeoPoint(lat: 27.128, lon: 142.215))
        drawText(ctx, "兄島", x: Double(aniPt.x) + 14, y: Double(aniPt.y) - 2, font: makeFont(size: 15, bold: true), color: rgba(30, 68, 52, clusterAlpha), align: .left, strokeColor: rgba(255, 255, 255, 0.94 * clusterAlpha), strokeWidth: 3.8)

        let aneImotoPt = cam.toScreen(GeoPoint(lat: 26.555, lon: 142.21))
        drawText(ctx, "姉島・妹島", x: Double(aneImotoPt.x) + 12, y: Double(aneImotoPt.y) + 4, font: makeFont(size: 14, bold: true), color: rgba(30, 68, 52, clusterAlpha), align: .left, strokeColor: rgba(255, 255, 255, 0.92 * clusterAlpha), strokeWidth: 3.5)

        // Hahajima callout label (left side of Hahajima)
        let hahaPt = cam.toScreen(GeoPoint(lat: 26.66, lon: 142.16))
        drawText(ctx, "母島（ははじま）", x: Double(hahaPt.x) - 22, y: Double(hahaPt.y) - 8, font: makeHeavyFont(size: 20), color: rgba(24, 72, 52, clusterAlpha), align: .right, strokeColor: rgba(255, 255, 255, 0.95 * clusterAlpha), strokeWidth: 4.5)
        drawText(ctx, "父島からさらに南へ約50km", x: Double(hahaPt.x) - 22, y: Double(hahaPt.y) + 15, font: makeFont(size: 14, bold: true), color: rgba(58, 88, 105, clusterAlpha), align: .right, strokeColor: rgba(255, 255, 255, 0.92 * clusterAlpha), strokeWidth: 3.8)

        // Nishinoshima label ( ~130km west of Chichijima )
        let nishiPt = cam.toScreen(GeoPoint(lat: 27.25, lon: 140.88))
        drawText(ctx, "西之島", x: Double(nishiPt.x), y: Double(nishiPt.y) - 22, font: makeHeavyFont(size: 20), color: rgba(28, 58, 78, clusterAlpha), align: .center, strokeColor: rgba(255, 255, 255, 0.95 * clusterAlpha), strokeWidth: 4.5)
        drawText(ctx, "（父島の西 約130km）", x: Double(nishiPt.x), y: Double(nishiPt.y) + 22, font: makeFont(size: 14, bold: true), color: rgba(58, 88, 105, clusterAlpha), align: .center, strokeColor: rgba(255, 255, 255, 0.92 * clusterAlpha), strokeWidth: 3.8)
    }

    // =========================================================================
    // 9. OVERLAY UI PANELS (Pure Educational Geography Infographic Style)
    // =========================================================================

    // A. Left Tall Overview Map + Live Distance & "船で24時間" Panel
    // Visible from t = 0.6s onward! Keeps the entire Honshu -> Izu -> Ogasawara 1,000km spatial relationship crystal-clear at ALL times!
    let leftAppear = easeOutCubic(progress(t, 0.5, 1.4))
    if leftAppear > 0.01 {
        let panelX = 44.0 + (1.0 - leftAppear) * (-40.0)
        let panelY = 42.0
        let panelW = 396.0
        let panelH = H - 84.0 // 996px tall

        fillRoundedRect(
            ctx,
            rect: CGRect(x: panelX, y: panelY, width: panelW, height: panelH),
            radius: 22,
            fill: rgba(255, 255, 255, 0.94 * leftAppear),
            stroke: rgba(190, 214, 232, 0.95 * leftAppear),
            lineWidth: 2.0,
            shadowAlpha: 0.14 * leftAppear,
            shadowBlur: 22.0
        )

        // Panel Header
        drawText(ctx, "日本の本州との位置関係", x: panelX + 26, y: panelY + 34, font: makeFont(size: 15, bold: true), color: rgba(55, 112, 156, leftAppear), align: .left, tracking: 1.0)
        drawText(ctx, "東京湾から南へ 1,000km", x: panelX + 26, y: panelY + 64, font: makeHeavyFont(size: 24), color: rgba(22, 40, 62, leftAppear), align: .left)

        // Mini Full-Route Overview Map Box inside Left Panel
        let miniX = panelX + 22.0
        let miniY = panelY + 92.0
        let miniW = panelW - 44.0 // 352
        let miniH = 580.0

        fillRoundedRect(
            ctx,
            rect: CGRect(x: miniX, y: miniY, width: miniW, height: miniH),
            radius: 14,
            fill: rgba(205, 233, 248, leftAppear),
            stroke: rgba(170, 204, 226, leftAppear),
            lineWidth: 1.5
        )

        ctx.saveGState()
        ctx.clip(to: CGRect(x: miniX, y: miniY, width: miniW, height: miniH))

        let miniCam = Camera(
            centerWX: -32.0,
            centerWY: 345.0,
            pxPerKm: 0.355,
            screenCenterX: miniX + miniW * 0.50,
            screenCenterY: miniY + miniH * 0.50
        )

        func buildMiniPath(_ coords: [(Double, Double)]) -> CGPath {
            let p = CGMutablePath()
            for (i, c) in coords.enumerated() {
                let pt = miniCam.toScreen(GeoPoint(lat: c.0, lon: c.1))
                if i == 0 { p.move(to: pt) } else { p.addLine(to: pt) }
            }
            p.closeSubpath()
            return p
        }

        // Honshu, Shikoku, Kyushu, Awaji, Sado & Lakes on mini map
        for mp in [buildMiniPath(honshuLand), buildMiniPath(shikokuLand), buildMiniPath(kyushuLand), buildMiniPath(awajiLand), buildMiniPath(sadoLand)] {
            ctx.setFillColor(rgba(242, 238, 222, leftAppear))
            ctx.addPath(mp)
            ctx.fillPath()
            ctx.setStrokeColor(rgba(120, 140, 126, 0.9 * leftAppear))
            ctx.setLineWidth(1.0)
            ctx.setLineJoin(.round)
            ctx.addPath(mp)
            ctx.strokePath()
        }
        for mlp in [buildMiniPath(lakeBiwa), buildMiniPath(lakeKasumigaura), buildMiniPath(lakeKitaura), buildMiniPath(lakeHamana), buildMiniPath(lakeInawashiro)] {
            ctx.setFillColor(rgba(196, 229, 246, leftAppear))
            ctx.addPath(mlp)
            ctx.fillPath()
        }

        let mHonshuLbl = miniCam.toScreen(GeoPoint(lat: 36.25, lon: 138.35))
        drawText(ctx, "本州", x: Double(mHonshuLbl.x), y: Double(mHonshuLbl.y), font: makeFont(size: 14, bold: true), color: rgba(92, 104, 98, leftAppear), align: .center)

        // Islands on mini map
        let miniIslands: [(String, GeoPoint, Bool)] = [
            ("伊豆大島", GeoPoint(lat: 34.73, lon: 139.40), true),
            ("八丈島", GeoPoint(lat: 33.11, lon: 139.80), true),
            ("青ヶ島", GeoPoint(lat: 32.45, lon: 139.76), false),
            ("鳥島", GeoPoint(lat: 30.48, lon: 140.30), true),
            ("西之島", GeoPoint(lat: 27.25, lon: 140.88), false),
            ("聟島", GeoPoint(lat: 27.68, lon: 142.14), false),
            ("父島", GeoPoint(lat: 27.08, lon: 142.19), true),
            ("母島", GeoPoint(lat: 26.66, lon: 142.16), false)
        ]
        for (nm, gp, showLbl) in miniIslands {
            let p = miniCam.toScreen(gp)
            let r = (nm == "父島") ? 4.2 : 3.0
            ctx.setFillColor(rgba(182, 224, 152, leftAppear))
            ctx.fillEllipse(in: CGRect(x: Double(p.x) - r, y: Double(p.y) - r, width: r * 2, height: r * 2))
            ctx.setStrokeColor(rgba(40, 110, 62, leftAppear))
            ctx.setLineWidth(1.2)
            ctx.strokeEllipse(in: CGRect(x: Double(p.x) - r, y: Double(p.y) - r, width: r * 2, height: r * 2))
            if showLbl && nm != "父島" {
                drawText(ctx, nm, x: Double(p.x) - 8, y: Double(p.y), font: makeFont(size: 12.5, bold: true), color: rgba(35, 65, 88, 0.9 * leftAppear), align: .right, strokeColor: rgba(255, 255, 255, 0.85 * leftAppear), strokeWidth: 3.0)
            }
        }

        // Animated full route arrow inside mini map!
        if t >= 2.4 {
            let mPath = CGMutablePath()
            let maxI = max(1, routeIdx)
            for i in 0...maxI {
                let s = ROUTE_SAMPLES[i]
                let p = miniCam.toScreenXY(s.wx, s.wy)
                if i == 0 { mPath.move(to: p) } else { mPath.addLine(to: p) }
            }
            ctx.setStrokeColor(rgba(255, 255, 255, 0.95 * leftAppear))
            ctx.setLineWidth(6.0)
            ctx.setLineCap(.round)
            ctx.addPath(mPath)
            ctx.strokePath()

            ctx.setStrokeColor(rgba(228, 78, 52, 0.98 * leftAppear))
            ctx.setLineWidth(3.5)
            ctx.setLineCap(.round)
            ctx.addPath(mPath)
            ctx.strokePath()

            let mTip = miniCam.toScreenXY(curSample.wx, curSample.wy)
            ctx.setFillColor(rgba(228, 78, 52, leftAppear))
            ctx.fillEllipse(in: CGRect(x: Double(mTip.x) - 5, y: Double(mTip.y) - 5, width: 10, height: 10))
        }

        // Tokyo Bay & Chichijima labels on mini map
        let mTokyo = miniCam.toScreen(GeoPoint(lat: 35.65, lon: 139.76))
        ctx.setFillColor(rgba(228, 78, 52, leftAppear))
        ctx.fillEllipse(in: CGRect(x: Double(mTokyo.x) - 4.5, y: Double(mTokyo.y) - 4.5, width: 9, height: 9))
        drawText(ctx, "東京湾", x: Double(mTokyo.x) + 9, y: Double(mTokyo.y) - 2, font: makeFont(size: 13.5, bold: true), color: rgba(195, 48, 28, leftAppear), align: .left, strokeColor: rgba(255, 255, 255, 0.9 * leftAppear), strokeWidth: 3.5)

        if t >= 13.6 {
            let mChichi = miniCam.toScreen(GeoPoint(lat: 27.08, lon: 142.19))
            // Highlight box showing zoomed area when zooming into archipelago!
            if archZoom > 0.05 {
                let zTL = miniCam.toScreen(GeoPoint(lat: 27.90, lon: 140.70))
                let zBR = miniCam.toScreen(GeoPoint(lat: 26.35, lon: 142.65))
                let zRect = CGRect(x: zTL.x, y: zTL.y, width: zBR.x - zTL.x, height: zBR.y - zTL.y)
                ctx.setFillColor(rgba(228, 78, 52, 0.12 * archZoom))
                ctx.fill(zRect)
                ctx.setStrokeColor(rgba(228, 78, 52, 0.85 * archZoom))
                ctx.setLineWidth(1.8)
                ctx.stroke(zRect)
                drawText(ctx, "小笠原諸島", x: Double((zTL.x + zBR.x) * 0.5), y: Double(zBR.y) + 15, font: makeFont(size: 13.5, bold: true), color: rgba(195, 48, 28, leftAppear), align: .center, strokeColor: rgba(255, 255, 255, 0.94 * leftAppear), strokeWidth: 3.5)
            } else {
                drawText(ctx, "父島（小笠原）", x: Double(mChichi.x) - 9, y: Double(mChichi.y) + 18, font: makeFont(size: 13, bold: true), color: rgba(195, 48, 28, leftAppear), align: .right, strokeColor: rgba(255, 255, 255, 0.94 * leftAppear), strokeWidth: 3.5)
            }
        }

        ctx.restoreGState() // End mini map clip

        // Live Distance Counter Box inside Left Panel
        let distBoxY = miniY + miniH + 18.0
        let distBoxH = 122.0
        fillRoundedRect(
            ctx,
            rect: CGRect(x: miniX, y: distBoxY, width: miniW, height: distBoxH),
            radius: 14,
            fill: rgba(245, 249, 253, leftAppear),
            stroke: rgba(208, 224, 238, leftAppear),
            lineWidth: 1.5
        )
        drawText(ctx, "東京湾からの航路距離", x: miniX + 20, y: distBoxY + 28, font: makeFont(size: 15, bold: true), color: rgba(78, 98, 118, leftAppear), align: .left)

        let shownKm = Int((curSample.distKm / 10.0).rounded() * 10.0)
        let distStr = (t < 2.6) ? "0 km" : (shownKm >= 990 ? "約 1,000 km" : "約 \(shownKm) km")
        drawText(ctx, distStr, x: miniX + miniW - 20, y: distBoxY + 78, font: makeHeavyFont(size: 40), color: rgba(208, 58, 36, leftAppear), align: .right)

        // Progress bar inside distance box
        let barX = miniX + 20.0
        let barY = distBoxY + 104.0
        let barW = miniW - 40.0
        fillRoundedRect(ctx, rect: CGRect(x: barX, y: barY, width: barW, height: 7), radius: 3.5, fill: rgba(215, 228, 238, leftAppear))
        if routeFrac > 0.005 {
            fillRoundedRect(ctx, rect: CGRect(x: barX, y: barY, width: max(8.0, barW * routeFrac), height: 7), radius: 3.5, fill: rgba(228, 78, 52, leftAppear))
        }

        // Prominent "船で24時間" Info Badge inside Left Panel (pops in smoothly at t = 5.0s!)
        let shipPop = easeOutBack(progress(t, 5.0, 5.9))
        if shipPop > 0.01 {
            let shipBoxY = distBoxY + distBoxH + 16.0
            let shipBoxH = 138.0
            let sAlpha = clamp(shipPop)
            fillRoundedRect(
                ctx,
                rect: CGRect(x: miniX, y: shipBoxY, width: miniW, height: shipBoxH),
                radius: 14,
                fill: rgba(24, 98, 152, sAlpha),
                stroke: rgba(18, 78, 126, sAlpha),
                lineWidth: 1.5,
                shadowAlpha: 0.14 * sAlpha
            )

            // Clean minimalist ferry icon (vector drawing, no emoji dependency)
            let icX = miniX + 38.0
            let icY = shipBoxY + 46.0
            ctx.saveGState()
            ctx.setFillColor(rgba(255, 255, 255, 0.20 * sAlpha))
            ctx.fillEllipse(in: CGRect(x: icX - 22, y: icY - 22, width: 44, height: 44))
            // Cabin
            ctx.setFillColor(rgba(255, 255, 255, sAlpha))
            ctx.fill(CGRect(x: icX - 10, y: icY - 11, width: 16, height: 8))
            ctx.fill(CGRect(x: icX - 5, y: icY - 16, width: 6, height: 5))
            // Hull
            let hull = CGMutablePath()
            hull.move(to: CGPoint(x: icX - 15, y: icY - 2))
            hull.addLine(to: CGPoint(x: icX + 16, y: icY - 2))
            hull.addLine(to: CGPoint(x: icX + 11, y: icY + 8))
            hull.addLine(to: CGPoint(x: icX - 12, y: icY + 8))
            hull.closeSubpath()
            ctx.addPath(hull)
            ctx.fillPath()
            // Gentle wave line under ship
            ctx.setStrokeColor(rgba(165, 228, 255, sAlpha))
            ctx.setLineWidth(2.2)
            ctx.move(to: CGPoint(x: icX - 15, y: icY + 13))
            ctx.addLine(to: CGPoint(x: icX + 15, y: icY + 13))
            ctx.strokePath()
            ctx.restoreGState()

            drawText(ctx, "船で 24時間", x: miniX + 74, y: shipBoxY + 44, font: makeHeavyFont(size: 34), color: rgba(255, 255, 255, sAlpha), align: .left)
            drawText(ctx, "空港はなく、東京湾（竹芝）から", x: miniX + 22, y: shipBoxY + 90, font: makeFont(size: 15, bold: true), color: rgba(224, 242, 254, sAlpha), align: .left)
            drawText(ctx, "定期船で丸1日かけて渡る海洋島", x: miniX + 22, y: shipBoxY + 114, font: makeFont(size: 15, bold: true), color: rgba(224, 242, 254, sAlpha), align: .left)
        }
    }

    // B. Top-Right Compass & Dynamic Scale Bar (Pure Cartographic Finish)
    let cx = W - 78.0
    let cy = 84.0
    ctx.saveGState()
    ctx.setFillColor(rgba(255, 255, 255, 0.90))
    ctx.fillEllipse(in: CGRect(x: cx - 34, y: cy - 34, width: 68, height: 68))
    ctx.setStrokeColor(rgba(160, 192, 214, 0.95))
    ctx.setLineWidth(1.6)
    ctx.strokeEllipse(in: CGRect(x: cx - 34, y: cy - 34, width: 68, height: 68))

    let northTri = CGMutablePath()
    northTri.move(to: CGPoint(x: cx, y: cy - 24))
    northTri.addLine(to: CGPoint(x: cx - 7, y: cy + 2))
    northTri.addLine(to: CGPoint(x: cx + 7, y: cy + 2))
    northTri.closeSubpath()
    ctx.setFillColor(rgba(228, 78, 52, 0.95))
    ctx.addPath(northTri)
    ctx.fillPath()

    let southTri = CGMutablePath()
    southTri.move(to: CGPoint(x: cx, y: cy + 24))
    southTri.addLine(to: CGPoint(x: cx - 7, y: cy + 2))
    southTri.addLine(to: CGPoint(x: cx + 7, y: cy + 2))
    southTri.closeSubpath()
    ctx.setFillColor(rgba(145, 168, 188, 0.85))
    ctx.addPath(southTri)
    ctx.fillPath()
    ctx.restoreGState()
    drawText(ctx, "N", x: cx, y: cy - 46, font: makeHeavyFont(size: 15), color: rgba(35, 65, 92, 0.92), align: .center)

    // Dynamic Scale Bar at bottom-right
    let refKm = (cam.pxPerKm > 3.2) ? 50.0 : 100.0
    let barPx = refKm * cam.pxPerKm
    let sbRight = W - 54.0
    let sbLeft = sbRight - barPx
    let sbY = H - 48.0
    fillRoundedRect(
        ctx,
        rect: CGRect(x: sbLeft - 18, y: sbY - 28, width: barPx + 36, height: 46),
        radius: 10,
        fill: rgba(255, 255, 255, 0.86),
        stroke: rgba(175, 204, 224, 0.90),
        lineWidth: 1.4
    )
    ctx.saveGState()
    ctx.setStrokeColor(rgba(32, 58, 82, 0.92))
    ctx.setLineWidth(2.4)
    ctx.move(to: CGPoint(x: sbLeft, y: sbY + 4))
    ctx.addLine(to: CGPoint(x: sbRight, y: sbY + 4))
    ctx.move(to: CGPoint(x: sbLeft, y: sbY - 3))
    ctx.addLine(to: CGPoint(x: sbLeft, y: sbY + 9))
    ctx.move(to: CGPoint(x: sbRight, y: sbY - 3))
    ctx.addLine(to: CGPoint(x: sbRight, y: sbY + 9))
    ctx.strokePath()
    ctx.restoreGState()
    drawText(ctx, "\(Int(refKm)) km", x: (sbLeft + sbRight) * 0.5, y: sbY - 12, font: makeFont(size: 14, bold: true), color: rgba(32, 58, 82, 0.92), align: .center)

    // C. Narrative Subtitle Bar during Scenes 1-3 (0.8s -> 17.6s) so first-time viewers follow effortlessly
    if t >= 0.8 && t < 18.2 {
        var caption = ""
        var capAlpha = 0.0
        if t < 4.6 {
            caption = "東京湾（竹芝）を出発し、太平洋をまっすぐ南へ——"
            capAlpha = min(progress(t, 0.8, 1.4), 1.0 - progress(t, 4.1, 4.6))
        } else if t < 9.8 {
            caption = "伊豆大島・三宅島・八丈島・青ヶ島……いくつもの島々を通り過ぎます"
            capAlpha = min(progress(t, 4.7, 5.3), 1.0 - progress(t, 9.3, 9.8))
        } else if t < 13.7 {
            caption = "鳥島を越えてさらに大海原へ——東京から約1,000km・船で24時間の航海"
            capAlpha = min(progress(t, 9.9, 10.4), 1.0 - progress(t, 13.2, 13.7))
        } else {
            caption = "父島へ到着。その周辺にはいくつもの島々が連なる「群島」が広がっています"
            capAlpha = min(progress(t, 13.8, 14.3), 1.0 - progress(t, 17.6, 18.2))
        }

        if capAlpha > 0.01 {
            let capFont = makeFont(size: 22, bold: true)
            let measured = measureText(caption, font: capFont)
            let cw = Double(measured.width) + 56.0
            let ch = 56.0
            let cxCenter = 440.0 + (W - 440.0) * 0.5
            fillRoundedRect(
                ctx,
                rect: CGRect(x: cxCenter - cw * 0.5, y: H - 96.0, width: cw, height: ch),
                radius: 28,
                fill: rgba(22, 42, 64, 0.86 * capAlpha),
                stroke: rgba(255, 255, 255, 0.35 * capAlpha),
                lineWidth: 1.5,
                shadowAlpha: 0.16 * capAlpha
            )
            drawText(ctx, caption, x: cxCenter, y: H - 68.0, font: capFont, color: rgba(255, 255, 255, capAlpha), align: .center)
        }
    }

    // D. Grand Finale Title Card: 「小笠原諸島」(18.0s -> 24.0s)
    // Positioned cleanly to the LEFT of the route line so zero overlap occurs!
    if t >= 18.0 {
        let titlePop = easeOutCubic(progress(t, 18.0, 19.0))
        let cardX = 480.0
        let cardY = 44.0 + (1.0 - titlePop) * (-18.0)
        let cardW = 640.0
        let cardH = 212.0

        fillRoundedRect(
            ctx,
            rect: CGRect(x: cardX, y: cardY, width: cardW, height: cardH),
            radius: 20,
            fill: rgba(255, 255, 255, 0.96 * titlePop),
            stroke: rgba(24, 98, 152, 0.85 * titlePop),
            lineWidth: 2.5,
            shadowAlpha: 0.18 * titlePop,
            shadowBlur: 24.0
        )

        // Accent bar on left inside title card
        fillRoundedRect(
            ctx,
            rect: CGRect(x: cardX + 24, y: cardY + 26, width: 8, height: cardH - 52),
            radius: 4,
            fill: rgba(228, 78, 52, titlePop)
        )

        drawText(
            ctx, "東京都 小笠原村  |  OGASAWARA ISLANDS",
            x: cardX + 50,
            y: cardY + 38,
            font: makeFont(size: 15.5, bold: true),
            color: rgba(32, 98, 148, titlePop),
            align: .left,
            tracking: 1.5
        )

        drawText(
            ctx, "小笠原諸島",
            x: cardX + 48,
            y: cardY + 92,
            font: makeHeavyFont(size: 56),
            color: rgba(18, 36, 56, titlePop),
            align: .left,
            tracking: 4.0
        )

        // Two crisp, well-padded summary lines inside the finale card
        drawText(
            ctx, "・東京湾から南へ 約1,000km（定期船で片道24時間）",
            x: cardX + 50,
            y: cardY + 148,
            font: makeFont(size: 18.5, bold: true),
            color: rgba(45, 65, 86, titlePop),
            align: .left
        )
        drawText(
            ctx, "・父島や母島など 大小30余りの島々からなる群島",
            x: cardX + 50,
            y: cardY + 180,
            font: makeFont(size: 18.5, bold: true),
            color: rgba(45, 65, 86, titlePop),
            align: .left
        )
    }

    // Gentle initial fade-in (0.0 -> 0.5s)
    if t < 0.5 {
        let fade = 1.0 - (t / 0.5)
        ctx.saveGState()
        ctx.setFillColor(rgba(235, 246, 252, fade))
        ctx.fill(CGRect(x: 0, y: 0, width: W, height: H))
        ctx.restoreGState()
    }
}

// MARK: - PNG Preview Export & MP4 Video Encoding

func createBitmapContext() -> (CGContext, UnsafeMutableRawPointer, Int) {
    let width = Int(W)
    let height = Int(H)
    let bytesPerRow = width * 4
    let rawData = UnsafeMutableRawPointer.allocate(byteCount: bytesPerRow * height, alignment: 64)
    let colorSpace = CGColorSpace(name: CGColorSpace.sRGB)!
    let bitmapInfo = CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue
    let ctx = CGContext(
        data: rawData,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: bytesPerRow,
        space: colorSpace,
        bitmapInfo: bitmapInfo
    )!
    // Flip to top-left origin (+X right, +Y down)
    ctx.translateBy(x: 0, y: CGFloat(height))
    ctx.scaleBy(x: 1.0, y: -1.0)
    return (ctx, rawData, bytesPerRow)
}

func savePNG(_ ctx: CGContext, to url: URL) throws {
    guard let image = ctx.makeImage() else { throw NSError(domain: "VideoGen", code: 1) }
    guard let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil) else {
        throw NSError(domain: "VideoGen", code: 2)
    }
    CGImageDestinationAddImage(dest, image, nil)
    if !CGImageDestinationFinalize(dest) {
        throw NSError(domain: "VideoGen", code: 3)
    }
}

func encodeMP4(to outputURL: URL) throws {
    if FileManager.default.fileExists(atPath: outputURL.path) {
        try FileManager.default.removeItem(at: outputURL)
    }
    try FileManager.default.createDirectory(at: outputURL.deletingLastPathComponent(), withIntermediateDirectories: true)

    let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
    let videoSettings: [String: Any] = [
        AVVideoCodecKey: AVVideoCodecType.h264,
        AVVideoWidthKey: Int(W),
        AVVideoHeightKey: Int(H),
        AVVideoCompressionPropertiesKey: [
            AVVideoAverageBitRateKey: 2_000_000,
            AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
            AVVideoMaxKeyFrameIntervalKey: 60
        ]
    ]

    let writerInput = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
    writerInput.expectsMediaDataInRealTime = false

    let sourceBufferAttrs: [String: Any] = [
        kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32BGRA),
        kCVPixelBufferWidthKey as String: Int(W),
        kCVPixelBufferHeightKey as String: Int(H)
    ]
    let adaptor = AVAssetWriterInputPixelBufferAdaptor(
        assetWriterInput: writerInput,
        sourcePixelBufferAttributes: sourceBufferAttrs
    )

    guard writer.canAdd(writerInput) else {
        throw NSError(domain: "VideoGen", code: 10, userInfo: [NSLocalizedDescriptionKey: "Cannot add video input"])
    }
    writer.add(writerInput)

    guard writer.startWriting() else {
        throw writer.error ?? NSError(domain: "VideoGen", code: 11)
    }
    writer.startSession(atSourceTime: .zero)

    let (ctx, rawData, srcBytesPerRow) = createBitmapContext()
    defer { rawData.deallocate() }

    for frame in 0..<TOTAL_FRAMES {
        while !writerInput.isReadyForMoreMediaData {
            Thread.sleep(forTimeInterval: 0.002)
        }
        let t = Double(frame) / Double(FPS)
        ctx.saveGState()
        renderFrame(ctx, time: t)
        ctx.restoreGState()

        guard let pool = adaptor.pixelBufferPool else {
            throw NSError(domain: "VideoGen", code: 12)
        }
        var pixelBufferOut: CVPixelBuffer?
        let status = CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pixelBufferOut)
        guard status == kCVReturnSuccess, let pixelBuffer = pixelBufferOut else {
            throw NSError(domain: "VideoGen", code: 13)
        }

        CVPixelBufferLockBaseAddress(pixelBuffer, [])
        if let dstBase = CVPixelBufferGetBaseAddress(pixelBuffer) {
            let dstBytesPerRow = CVPixelBufferGetBytesPerRow(pixelBuffer)
            let height = Int(H)
            if dstBytesPerRow == srcBytesPerRow {
                memcpy(dstBase, rawData, srcBytesPerRow * height)
            } else {
                for row in 0..<height {
                    memcpy(dstBase.advanced(by: row * dstBytesPerRow), rawData.advanced(by: row * srcBytesPerRow), srcBytesPerRow)
                }
            }
        }
        CVPixelBufferUnlockBaseAddress(pixelBuffer, [])

        let presentationTime = CMTime(value: CMTimeValue(frame), timescale: FPS)
        if !adaptor.append(pixelBuffer, withPresentationTime: presentationTime) {
            throw writer.error ?? NSError(domain: "VideoGen", code: 14)
        }
    }

    writerInput.markAsFinished()
    let sema = DispatchSemaphore(value: 0)
    writer.finishWriting {
        sema.signal()
    }
    sema.wait()

    if writer.status != .completed {
        throw writer.error ?? NSError(domain: "VideoGen", code: 15)
    }
}

// MARK: - CLI Entrypoint

let args = CommandLine.arguments
if let idx = args.firstIndex(of: "--preview-frames"), idx + 1 < args.count {
    let dirURL = URL(fileURLWithPath: args[idx + 1])
    try FileManager.default.createDirectory(at: dirURL, withIntermediateDirectories: true)
    let (ctx, rawData, _) = createBitmapContext()
    defer { rawData.deallocate() }

    let sampleTimes: [Double] = [1.8, 5.8, 8.8, 12.0, 14.3, 17.5, 21.0]
    for (i, t) in sampleTimes.enumerated() {
        ctx.saveGState()
        renderFrame(ctx, time: t)
        ctx.restoreGState()
        let out = dirURL.appendingPathComponent(String(format: "frame_%02d_t%.1fs.png", i + 1, t))
        try savePNG(ctx, to: out)
        print("Saved preview: \(out.path)")
    }
} else {
    let outPath: String
    if let idx = args.firstIndex(of: "--output"), idx + 1 < args.count {
        outPath = args[idx + 1]
    } else {
        outPath = "assets/scenarios/project-deep-sea/releases/videos/ogasawara_geography_intro.mp4"
    }
    print("Encoding 1920x1080 30fps MP4 to \(outPath) ...")
    try encodeMP4(to: URL(fileURLWithPath: outPath))
    print("Done: \(outPath)")
}
