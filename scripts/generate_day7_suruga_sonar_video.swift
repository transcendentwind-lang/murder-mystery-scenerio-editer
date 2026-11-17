import Foundation
import CoreGraphics
import CoreText
import ImageIO
import AVFoundation
import UniformTypeIdentifiers

// MARK: - Constants & Math Helpers

let W: Double = 1920.0
let H: Double = 1080.0
let FPS: Int32 = 30
let DURATION: Double = 25.0
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

func easeInQuad(_ x: Double) -> Double {
    let t = clamp(x)
    return t * t
}

func easeOutCubic(_ x: Double) -> Double {
    let t = clamp(x)
    return 1 - pow(1 - t, 3)
}

func lerp(_ a: Double, _ b: Double, _ t: Double) -> Double {
    return a + (b - a) * t
}

func rgba(_ r: Int, _ g: Int, _ b: Int, _ a: Double = 1.0) -> CGColor {
    return CGColor(
        colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!,
        components: [CGFloat(r) / 255.0, CGFloat(g) / 255.0, CGFloat(b) / 255.0, CGFloat(a)]
    )!
}

// MARK: - Deterministic Pseudo-Random Generator (for reproducible whale swarm!)

struct SeededRNG {
    var state: UInt64
    init(seed: UInt64) { self.state = seed }
    mutating func nextUInt64() -> UInt64 {
        state = state &* 6364136223846793005 &+ 1442695040888963407
        return state
    }
    mutating func nextDouble() -> Double {
        return Double(nextUInt64() >> 11) / Double(1 << 53)
    }
    mutating func range(_ lo: Double, _ hi: Double) -> Double {
        return lo + (hi - lo) * nextDouble()
    }
}

// MARK: - Geographic Projection Centered on Suruga Bay Mouth
// Target Position (駿河湾口): 34.61°N, 138.55°E (midway between Omaezaki 34.60,138.23 & Irozaki 34.60,138.85!)

let TARGET_LAT = 34.61
let TARGET_LON = 138.55
let KM_PER_LAT = 111.1
let KM_PER_LON = 91.4 // cos(34.7°N) * 111.3

struct GeoPoint {
    let lat: Double
    let lon: Double
    var wx: Double { (lon - TARGET_LON) * KM_PER_LON }
    var wy: Double { (TARGET_LAT - lat) * KM_PER_LAT } // +Y = South, -Y = North
}

let TARGET_GP = GeoPoint(lat: TARGET_LAT, lon: TARGET_LON) // (0, 0) in km!

struct MapViewport {
    // Map occupies right area (x: 450..1920), or full screen background with left HUD panel at x: 36..436
    let centerWX: Double = 2.0
    let centerWY: Double = -10.0 // Slightly north of target so Suruga Bay + Mt. Fuji + Southern Ocean all balance!
    let pxPerKm: Double = 7.4    // 1080px = ~146km north-south (33.95°N to 35.38°N -> Mt. Fuji at top, Pacific Ocean at bottom!)
    let screenCenterX: Double = 1185.0
    let screenCenterY: Double = 555.0

    func toScreen(_ gp: GeoPoint) -> CGPoint {
        return toScreenXY(gp.wx, gp.wy)
    }

    func toScreenXY(_ wx: Double, _ wy: Double) -> CGPoint {
        return CGPoint(
            x: screenCenterX + (wx - centerWX) * pxPerKm,
            y: screenCenterY + (wy - centerWY) * pxPerKm
        )
    }
}

let VIEW = MapViewport()

// MARK: - High-Precision Suruga Bay, Izu Peninsula & Tokai Coastline

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
            next.append((p0.0 * 0.80 + p1.0 * 0.20, p0.1 * 0.80 + p1.1 * 0.20))
            next.append((p0.0 * 0.20 + p1.0 * 0.80, p0.1 * 0.20 + p1.1 * 0.80))
        }
        cur = next
    }
    return cur
}

// Detailed Suruga Bay & Izu Peninsula & Enshu/Sagami Coastline (extended west to 136.2°E so no polygon closure edge is visible on screen)
let surugaHonshuRaw: [(Double, Double)] = [
    (36.20, 136.20), (34.62, 136.20), (34.58, 137.02), (34.63, 137.25),
    // Enshu-nada -> Omaezaki
    (34.67, 137.45), (34.66, 137.65), (34.65, 137.82), (34.66, 137.98), (34.64, 138.11),
    (34.61, 138.18), (34.598, 138.228), // Cape Omaezaki (御前崎)!
    // West Shore of Suruga Bay (Omaezaki -> Sagara -> Yoshida -> Yaizu -> Shizuoka -> Miho -> Shimizu)
    (34.64, 138.215), (34.69, 138.208), (34.74, 138.255), (34.78, 138.295), // Sagara -> Oi River
    (34.83, 138.322), (34.87, 138.332), (34.90, 138.348), // Yaizu -> Okuzure
    (34.93, 138.395), (34.96, 138.455), (34.99, 138.505), // Mochimune -> Abe River -> Kunozan
    (35.015, 138.534), (35.002, 138.522), (35.012, 138.498), // Miho-no-Matsubara spit & Shimizu Port!
    (35.048, 138.522), (35.082, 138.558), (35.112, 138.618), // Okitsu -> Yui -> Fuji River
    // Innermost Suruga Bay (Tagonoura -> Hara -> Numazu -> Uchiura)
    (35.134, 138.685), (35.128, 138.755), (35.108, 138.828), (35.085, 138.858), // Tagonoura -> Senbonhama/Numazu
    (35.042, 138.888), (35.018, 138.892), (35.012, 138.855), (35.018, 138.812), // Uchiura Bay
    (35.030, 138.786), // Osezaki Cape (大瀬崎 jutting into Suruga Bay!)
    // West Coast of Izu Peninsula (Ida -> Heda -> Toi -> Dogashima -> Matsuzaki -> Hagachizaki -> Irozaki)
    (35.002, 138.782), (34.972, 138.768), (34.940, 138.775), (34.910, 138.788), // Heda -> Toi
    (34.872, 138.766), (34.832, 138.762), (34.785, 138.758), (34.752, 138.774), // Ugusu -> Dogashima -> Matsuzaki
    (34.722, 138.752), (34.692, 138.746), (34.655, 138.776), (34.625, 138.812), // Kumomi -> Hagachizaki -> Mera
    (34.600, 138.848), // Cape Irozaki (石廊崎)!
    // East Coast of Izu Peninsula -> Sagami Bay
    (34.628, 138.892), (34.668, 138.948), (34.658, 138.992), (34.695, 138.982), // Yumigahama -> Shimoda -> Tsumekizaki
    (34.742, 139.005), (34.772, 139.052), (34.815, 139.072), (34.882, 139.132), // Kawazu -> Inatori -> Izu-Kogen
    (34.945, 139.148), (34.978, 139.105), (35.042, 139.088), (35.096, 139.078), // Kawana -> Ito -> Atami
    (35.145, 139.108), (35.144, 139.158), (35.175, 139.138), (35.245, 139.155), // Yugawara -> Manazuru -> Odawara
    (35.285, 139.225), (35.312, 139.335), (35.305, 139.485), (35.295, 139.555), // Oiso -> Enoshima -> Kamakura
    (35.190, 139.605), (35.135, 139.622), (35.250, 139.745), (35.450, 139.650),
    (36.00, 139.85)
]

let surugaHonshu = smoothCoastline(surugaHonshuRaw, iterations: 1)

// Nearby Izu Islands visible in the south-east of the radar
let izuIslands: [(String, Double, Double, Double, Double)] = [
    ("伊豆大島", 34.73, 139.40, 4.5, 6.2),
    ("利島", 34.52, 139.28, 1.8, 1.8),
    ("新島", 34.37, 139.27, 2.0, 4.5),
    ("式根島", 34.325, 139.21, 1.4, 1.2),
    ("神津島", 34.21, 139.15, 2.5, 3.2)
]

// Bathymetry Contour Polygons for Suruga Trough (1,000m & 1,500m-2,500m deep-sea canyon running right into Suruga Bay!)
let trough1000mRaw: [(Double, Double)] = [
    (35.03, 138.66), (35.02, 138.74), (34.92, 138.72), (34.78, 138.69),
    (34.62, 138.68), (34.42, 138.66), (34.15, 138.62), (33.85, 138.55),
    (33.85, 138.28), (34.18, 138.36), (34.42, 138.41), (34.60, 138.42),
    (34.78, 138.48), (34.93, 138.56)
]
let trough1800mRaw: [(Double, Double)] = [
    (34.96, 138.66), (34.82, 138.63), (34.62, 138.60), (34.38, 138.57),
    (33.90, 138.48), (33.90, 138.38), (34.38, 138.47), (34.62, 138.50),
    (34.82, 138.55), (34.95, 138.61)
]

let trough1000m = smoothCoastline(trough1000mRaw, iterations: 2)
let trough1800m = smoothCoastline(trough1800mRaw, iterations: 2)

// MARK: - JMSDF Standby Fleet Positions (Waiting in inner/mouth defense arc of Suruga Bay)

struct NavalUnit {
    let code: String
    let gp: GeoPoint
    let isSubmarine: Bool
}

let jmsdfUnits: [NavalUnit] = [
    NavalUnit(code: "SS-01", gp: GeoPoint(lat: 34.71, lon: 138.50), isSubmarine: true),
    NavalUnit(code: "SS-02", gp: GeoPoint(lat: 34.70, lon: 138.62), isSubmarine: true),
    NavalUnit(code: "SS-03", gp: GeoPoint(lat: 34.66, lon: 138.42), isSubmarine: true),
    NavalUnit(code: "DD-11", gp: GeoPoint(lat: 34.77, lon: 138.46), isSubmarine: false),
    NavalUnit(code: "DD-12", gp: GeoPoint(lat: 34.78, lon: 138.56), isSubmarine: false),
    NavalUnit(code: "DD-13", gp: GeoPoint(lat: 34.76, lon: 138.66), isSubmarine: false)
]

// MARK: - Whale Pod Trajectory Model (1 Lead White Whale + 115 Following Whales!)

struct WhaleAgent {
    let isLeader: Bool
    let startWX: Double
    let startWY: Double
    let midWX: Double     // Gathering / staging point south of target before final dive!
    let midWY: Double
    let finalOffsetWX: Double // Tiny offset (~0.0 to 1.6 km) right on top of Target (0, 0)!
    let finalOffsetWY: Double
    let appearTime: Double
    let gatherEndTime: Double
    let diveStartTime: Double
    let diveEndTime: Double
}

func generateWhales() -> [WhaleAgent] {
    var whales: [WhaleAgent] = []

    // 1. The Lead White Whale ("白いクジラ" - appears alone first from the south at t = 4.0s!)
    whales.append(WhaleAgent(
        isLeader: true,
        startWX: 1.5,
        startWY: 54.0,   // ~34.12°N (southern edge of Suruga Trough)
        midWX: 0.6,
        midWY: 13.5,     // Pauses/cruises ~13.5km south of Target as the pod rallies behind it
        finalOffsetWX: 0.0,
        finalOffsetWY: 0.0, // Dives dead-center onto Target (0, 0)!
        appearTime: 4.0,
        gatherEndTime: 9.2,
        diveStartTime: 13.2,
        diveEndTime: 16.4
    ))

    // 2. 115 Following Sperm Whales streaming in from south / SSW / SSE!
    var rng = SeededRNG(seed: 20261117)
    let count = 115
    for i in 0..<count {
        let frac = Double(i) / Double(count - 1)
        // Appear progressively between t = 6.8s and t = 12.8s (first a few, then an overwhelming wave!)
        let appear = 6.8 + pow(frac, 0.78) * 5.8 + rng.range(-0.18, 0.18)

        // Fan in from south (-36km .. +38km east-west, 48km .. 78km south)
        let angleSpread = rng.range(-0.58, 0.58) // radians from due south
        let startDist = rng.range(48.0, 76.0)
        let sWX = sin(angleSpread) * startDist
        let sWY = cos(angleSpread) * startDist

        // Rallying arc 12km .. 28km south/southeast/southwest of target
        let midAngle = angleSpread * 0.72 + rng.range(-0.18, 0.18)
        let midDist = rng.range(12.5, 29.0)
        let mWX = sin(midAngle) * midDist
        let mWY = cos(midAngle) * midDist

        let gatherEnd = min(13.3, appear + rng.range(2.8, 4.3))
        // All dive together in an unstoppable surge between t = 13.5s and t = 19.6s!
        let diveStart = 13.5 + pow(frac, 0.85) * 2.8 + rng.range(0.0, 0.55)
        let diveEnd = diveStart + rng.range(2.5, 3.6)

        // Final coordinates overlap right onto the Target's coordinates (within r = 0.0 .. 1.9 km)!
        let fAng = rng.range(0.0, Double.pi * 2.0)
        let fRad = pow(rng.nextDouble(), 0.7) * 1.85
        whales.append(WhaleAgent(
            isLeader: false,
            startWX: sWX,
            startWY: sWY,
            midWX: mWX,
            midWY: mWY,
            finalOffsetWX: cos(fAng) * fRad,
            finalOffsetWY: sin(fAng) * fRad,
            appearTime: appear,
            gatherEndTime: max(appear + 0.8, gatherEnd),
            diveStartTime: max(gatherEnd, diveStart),
            diveEndTime: max(gatherEnd + 1.8, diveEnd)
        ))
    }
    return whales
}

let WHALES = generateWhales()

struct WhaleState {
    let visible: Bool
    let alpha: Double
    let wx: Double
    let wy: Double
    let depthM: Double     // ~40m cruising -> 950m deep dive!
    let diveFrac: Double   // 0 = surface/shallow approach, 1 = deep overlap at 950m
    let isLeader: Bool
}

func evaluateWhale(_ w: WhaleAgent, at t: Double) -> WhaleState {
    guard t >= w.appearTime else {
        return WhaleState(visible: false, alpha: 0, wx: w.startWX, wy: w.startWY, depthM: 40, diveFrac: 0, isLeader: w.isLeader)
    }
    let fade = clamp((t - w.appearTime) / 0.55)

    if t < w.diveStartTime {
        // Approaching & gathering from South
        let g = easeOutCubic(progress(t, w.appearTime, w.diveStartTime))
        // Slight continuing northward drift even after reaching mid-zone
        let wx = lerp(w.startWX, w.midWX, g)
        let wy = lerp(w.startWY, w.midWY, g)
        return WhaleState(visible: true, alpha: fade, wx: wx, wy: wy, depthM: 45.0 + g * 55.0, diveFrac: 0.0, isLeader: w.isLeader)
    } else {
        // Diving straight into the Target at (0, 0) & Depth 950m!
        let d = easeInOutCubic(progress(t, w.diveStartTime, w.diveEndTime))
        let postTime = max(0.0, t - w.diveEndTime)
        // Subtle organic circling micro-motion right on the target coordinates after arrival
        let orbitAng = postTime * 1.4 + (w.finalOffsetWX * 3.0)
        let settleFactor = max(0.35, 1.0 - postTime * 0.08)
        let targetX = w.finalOffsetWX * settleFactor + cos(orbitAng) * 0.22 * d
        let targetY = w.finalOffsetWY * settleFactor + sin(orbitAng) * 0.22 * d

        let wx = lerp(w.midWX, targetX, d)
        let wy = lerp(w.midWY, targetY, d)
        let depth = lerp(100.0, 950.0, easeInQuad(progress(t, w.diveStartTime, w.diveEndTime)))
        return WhaleState(visible: true, alpha: fade, wx: wx, wy: wy, depthM: depth, diveFrac: d, isLeader: w.isLeader)
    }
}

// MARK: - Typography & Vector Drawing Helpers

func makeFont(size: Double, bold: Bool) -> CTFont {
    let name = bold ? "HiraginoSans-W6" : "HiraginoSans-W3"
    return CTFontCreateWithName(name as CFString, CGFloat(size), nil)
}

func makeHeavyFont(size: Double) -> CTFont {
    return CTFontCreateWithName("HiraginoSans-W7" as CFString, CGFloat(size), nil)
}

func makeMonoFont(size: Double, bold: Bool = true) -> CTFont {
    let name = bold ? "Menlo-Bold" : "Menlo-Regular"
    return CTFontCreateWithName(name as CFString, CGFloat(size), nil)
}

enum TextAlign { case left, center, right }

func measureText(_ text: String, font: CTFont, tracking: Double = 0.0) -> CGSize {
    let attrs: [NSAttributedString.Key: Any] = [
        NSAttributedString.Key(kCTFontAttributeName as String): font,
        NSAttributedString.Key(kCTKernAttributeName as String): NSNumber(value: tracking)
    ]
    let line = CTLineCreateWithAttributedString(NSAttributedString(string: text, attributes: attrs))
    var ascent: CGFloat = 0, descent: CGFloat = 0, leading: CGFloat = 0
    let width = CTLineGetTypographicBounds(line, &ascent, &descent, &leading)
    return CGSize(width: width, height: ascent + descent)
}

func drawText(
    _ ctx: CGContext,
    _ text: String,
    x: Double,
    y: Double,
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
    let line = CTLineCreateWithAttributedString(NSAttributedString(string: text, attributes: attrs))
    var ascent: CGFloat = 0, descent: CGFloat = 0, leading: CGFloat = 0
    let width = Double(CTLineGetTypographicBounds(line, &ascent, &descent, &leading))

    var drawX = x
    if align == .center { drawX = x - width * 0.5 }
    else if align == .right { drawX = x - width }
    let baselineY = y + Double(ascent - descent) * 0.5

    if let sCol = strokeColor, strokeWidth > 0 {
        ctx.saveGState()
        var sAttrs = attrs
        sAttrs[NSAttributedString.Key(kCTStrokeColorAttributeName as String)] = sCol
        sAttrs[NSAttributedString.Key(kCTStrokeWidthAttributeName as String)] = NSNumber(value: strokeWidth)
        let sLine = CTLineCreateWithAttributedString(NSAttributedString(string: text, attributes: sAttrs))
        ctx.textMatrix = CGAffineTransform(scaleX: 1.0, y: -1.0)
        ctx.textPosition = CGPoint(x: drawX, y: baselineY)
        CTLineDraw(sLine, ctx)
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
    lineWidth: Double = 1.5
) {
    let path = CGPath(roundedRect: rect, cornerWidth: CGFloat(radius), cornerHeight: CGFloat(radius), transform: nil)
    ctx.saveGState()
    ctx.setFillColor(fill)
    ctx.addPath(path)
    ctx.fillPath()
    if let st = stroke {
        ctx.setStrokeColor(st)
        ctx.setLineWidth(CGFloat(lineWidth))
        ctx.addPath(path)
        ctx.strokePath()
    }
    ctx.restoreGState()
}

func buildGeoPath(_ coords: [(Double, Double)]) -> CGPath {
    let path = CGMutablePath()
    for (i, c) in coords.enumerated() {
        let pt = VIEW.toScreen(GeoPoint(lat: c.0, lon: c.1))
        if i == 0 { path.move(to: pt) } else { path.addLine(to: pt) }
    }
    path.closeSubpath()
    return path
}

// MARK: - Main Frame Renderer

func renderFrame(_ ctx: CGContext, time t: Double) {
    let colorSpace = CGColorSpace(name: CGColorSpace.sRGB)!

    // Target shrinkage & elimination curve:
    // Full ominous strength until t = 16.2s, then shrinks rapidly as 100+ whales overlap & devour it, vanishing by t = 21.0s!
    let targetShrink = easeInOutCubic(progress(t, 16.2, 21.0))
    let targetStrength = 1.0 - targetShrink // 1.0 -> 0.0

    // 1. Deep Abyssal Sonar Ocean Background
    let bgGrad = CGGradient(
        colorsSpace: colorSpace,
        colors: [
            rgba(6, 19, 32, 1.0),
            rgba(4, 14, 25, 1.0),
            rgba(3, 10, 19, 1.0)
        ] as CFArray,
        locations: [0.0, 0.55, 1.0]
    )!
    ctx.drawLinearGradient(bgGrad, start: CGPoint(x: W * 0.5, y: 0), end: CGPoint(x: W * 0.5, y: H), options: [])

    // 2. Suruga Trough Deep-Sea Bathymetry Contours (1,000m & 1,800m+ Trench Axis)
    let p1000 = buildGeoPath(trough1000m)
    let p1800 = buildGeoPath(trough1800m)

    ctx.saveGState()
    ctx.setFillColor(rgba(8, 34, 54, 0.55))
    ctx.addPath(p1000)
    ctx.fillPath()
    ctx.setStrokeColor(rgba(38, 118, 158, 0.35))
    ctx.setLineWidth(1.3)
    ctx.setLineDash(phase: 0, lengths: [5, 5])
    ctx.addPath(p1000)
    ctx.strokePath()

    ctx.setFillColor(rgba(5, 24, 42, 0.65))
    ctx.addPath(p1800)
    ctx.fillPath()
    ctx.setStrokeColor(rgba(56, 152, 196, 0.28))
    ctx.setLineWidth(1.1)
    ctx.addPath(p1800)
    ctx.strokePath()
    ctx.restoreGState()

    // Subtle Suruga Trough bathymetry label
    let troughLblPt = VIEW.toScreen(GeoPoint(lat: 34.34, lon: 138.64))
    drawText(ctx, "駿河トラフ（水深 1,000〜2,500m）", x: Double(troughLblPt.x) + 12, y: Double(troughLblPt.y), font: makeFont(size: 13.5, bold: true), color: rgba(68, 148, 185, 0.55), align: .left)

    // 3. Draw Landmasses (Suruga Bay Coastline, Izu Peninsula, Omaezaki, Izu Islands)
    let honshuPath = buildGeoPath(surugaHonshu)

    ctx.saveGState()
    // Shallow coastal sonar shoreline glow
    ctx.setStrokeColor(rgba(34, 128, 165, 0.26))
    ctx.setLineWidth(8.0)
    ctx.setLineJoin(.round)
    ctx.addPath(honshuPath)
    ctx.strokePath()

    // Dark tactical slate terrain fill
    ctx.setFillColor(rgba(14, 32, 46, 0.96))
    ctx.addPath(honshuPath)
    ctx.fillPath()

    // Crisp coastline rim
    ctx.setStrokeColor(rgba(62, 162, 198, 0.78))
    ctx.setLineWidth(2.0)
    ctx.setLineJoin(.round)
    ctx.addPath(honshuPath)
    ctx.strokePath()
    ctx.restoreGState()

    // Nearby Izu Islands
    for (name, lat, lon, rxKm, ryKm) in izuIslands {
        let pt = VIEW.toScreen(GeoPoint(lat: lat, lon: lon))
        let rx = rxKm * VIEW.pxPerKm
        let ry = ryKm * VIEW.pxPerKm
        let rect = CGRect(x: Double(pt.x) - rx, y: Double(pt.y) - ry, width: rx * 2, height: ry * 2)
        ctx.saveGState()
        ctx.setFillColor(rgba(14, 32, 46, 0.96))
        ctx.fillEllipse(in: rect)
        ctx.setStrokeColor(rgba(62, 162, 198, 0.72))
        ctx.setLineWidth(1.6)
        ctx.strokeEllipse(in: rect)
        ctx.restoreGState()
        if name == "伊豆大島" || name == "新島" || name == "神津島" {
            drawText(ctx, name, x: Double(pt.x) + rx + 8, y: Double(pt.y), font: makeFont(size: 13.5, bold: true), color: rgba(118, 178, 204, 0.68), align: .left)
        }
    }

    // 4. Tactical Sonar Grid, Range Rings & Rotating Radar Sweep Centered on Suruga Bay Mouth!
    let targetPt = VIEW.toScreen(TARGET_GP) // Suruga Bay Mouth (34.61°N, 138.55°E)

    // Subtle Lat/Lon Grid
    ctx.saveGState()
    ctx.setStrokeColor(rgba(56, 138, 175, 0.14))
    ctx.setLineWidth(1.0)
    for lat in stride(from: 34.0, through: 35.4, by: 0.2) {
        let p = VIEW.toScreen(GeoPoint(lat: lat, lon: TARGET_LON))
        ctx.move(to: CGPoint(x: 440, y: p.y))
        ctx.addLine(to: CGPoint(x: W, y: p.y))
    }
    for lon in stride(from: 138.0, through: 139.4, by: 0.2) {
        let p = VIEW.toScreen(GeoPoint(lat: TARGET_LAT, lon: lon))
        if p.x > 440 {
            ctx.move(to: CGPoint(x: p.x, y: 0))
            ctx.addLine(to: CGPoint(x: p.x, y: H))
        }
    }
    ctx.strokePath()
    ctx.restoreGState()

    // Concentric Sonar Range Rings (10km, 20km, 30km, 45km, 60km)
    let fontRing = makeMonoFont(size: 12, bold: true)
    for kmRing in [10.0, 20.0, 30.0, 45.0, 60.0] {
        let rPx = kmRing * VIEW.pxPerKm
        ctx.saveGState()
        ctx.setStrokeColor(rgba(56, 189, 248, kmRing == 30.0 ? 0.34 : 0.20))
        ctx.setLineWidth(kmRing == 30.0 ? 1.5 : 1.0)
        if kmRing != 30.0 {
            ctx.setLineDash(phase: 0, lengths: [4, 6])
        }
        ctx.strokeEllipse(in: CGRect(x: Double(targetPt.x) - rPx, y: Double(targetPt.y) - rPx, width: rPx * 2, height: rPx * 2))
        ctx.restoreGState()

        if kmRing >= 20.0 && kmRing <= 45.0 {
            // Place range ring labels along SW open-ocean bearing (+148°) so they never touch Izu Peninsula!
            let ang = Double.pi * 0.80
            let lblX = Double(targetPt.x) + rPx * cos(ang) - 6
            let lblY = Double(targetPt.y) + rPx * sin(ang) + 4
            drawText(ctx, "\(Int(kmRing))km", x: lblX, y: lblY, font: fontRing, color: rgba(75, 175, 215, 0.56), align: .right)
        }
    }

    // Crosshair axes through Suruga Bay Mouth
    ctx.saveGState()
    ctx.setStrokeColor(rgba(56, 189, 248, 0.20))
    ctx.setLineWidth(1.0)
    let maxR = 62.0 * VIEW.pxPerKm
    ctx.move(to: CGPoint(x: Double(targetPt.x) - maxR, y: Double(targetPt.y)))
    ctx.addLine(to: CGPoint(x: Double(targetPt.x) + maxR, y: Double(targetPt.y)))
    ctx.move(to: CGPoint(x: Double(targetPt.x), y: Double(targetPt.y) - maxR))
    ctx.addLine(to: CGPoint(x: Double(targetPt.x), y: Double(targetPt.y) + maxR))
    ctx.strokePath()
    ctx.restoreGState()

    // Rotating Passive/Active Sonar Sweep Sector (1 rotation every 4.2s)
    let sweepAngle = (t / 4.2) * Double.pi * 2.0 - Double.pi * 0.5
    let sweepRadius = 60.0 * VIEW.pxPerKm
    ctx.saveGState()
    let trailSteps = 18
    let sectorSpan = 0.48 // radians (~27 degrees glowing wedge)
    for s in 0..<trailSteps {
        let f0 = Double(s) / Double(trailSteps)
        let f1 = Double(s + 1) / Double(trailSteps)
        let a0 = sweepAngle - sectorSpan * (1.0 - f0)
        let a1 = sweepAngle - sectorSpan * (1.0 - f1)
        let wedge = CGMutablePath()
        wedge.move(to: targetPt)
        wedge.addArc(center: targetPt, radius: CGFloat(sweepRadius), startAngle: CGFloat(a0), endAngle: CGFloat(a1), clockwise: false)
        wedge.closeSubpath()
        ctx.setFillColor(rgba(34, 211, 238, 0.008 * f1 * f1 * 14.0))
        ctx.addPath(wedge)
        ctx.fillPath()
    }
    // Leading crisp sweep line
    ctx.setStrokeColor(rgba(103, 232, 249, 0.55))
    ctx.setLineWidth(1.8)
    ctx.move(to: targetPt)
    ctx.addLine(to: CGPoint(x: Double(targetPt.x) + cos(sweepAngle) * sweepRadius, y: Double(targetPt.y) + sin(sweepAngle) * sweepRadius))
    ctx.strokePath()
    ctx.restoreGState()

    // 5. Geographic Landmarks (駿河湾, 伊豆半島, 御前崎, 石廊崎, 富士山 + Seismic Status)
    let surugaBayCenter = VIEW.toScreen(GeoPoint(lat: 34.88, lon: 138.58))
    drawText(ctx, "駿 河 湾", x: Double(surugaBayCenter.x), y: Double(surugaBayCenter.y), font: makeHeavyFont(size: 24), color: rgba(125, 205, 238, 0.45), align: .center, tracking: 8.0)

    let izuPt = VIEW.toScreen(GeoPoint(lat: 34.86, lon: 138.92))
    drawText(ctx, "伊豆半島", x: Double(izuPt.x), y: Double(izuPt.y), font: makeFont(size: 18, bold: true), color: rgba(148, 188, 208, 0.72), align: .center)

    let omaePt = VIEW.toScreen(GeoPoint(lat: 34.60, lon: 138.23))
    drawText(ctx, "御前崎", x: Double(omaePt.x) - 8, y: Double(omaePt.y) - 16, font: makeFont(size: 15.5, bold: true), color: rgba(168, 204, 222, 0.85), align: .right)

    let iroPt = VIEW.toScreen(GeoPoint(lat: 34.60, lon: 138.85))
    drawText(ctx, "石廊崎", x: Double(iroPt.x) + 10, y: Double(iroPt.y) - 14, font: makeFont(size: 15.5, bold: true), color: rgba(168, 204, 222, 0.85), align: .left)

    let shizuokaPt = VIEW.toScreen(GeoPoint(lat: 35.02, lon: 138.38))
    drawText(ctx, "静岡・清水", x: Double(shizuokaPt.x) - 10, y: Double(shizuokaPt.y), font: makeFont(size: 14, bold: true), color: rgba(128, 165, 184, 0.68), align: .right)

    // Mt. Fuji at Northern Top of Suruga Bay (35.36°N, 138.73°E)
    let fujiPt = VIEW.toScreen(GeoPoint(lat: 35.35, lon: 138.73))
    ctx.saveGState()
    if targetStrength > 0.05 {
        // Volcanic tremor warning pulse around Mt. Fuji while target is active
        let fPulse = (sin(t * 5.0) * 0.5 + 0.5) * targetStrength
        let fR = 18.0 + fPulse * 18.0
        ctx.setFillColor(rgba(245, 158, 11, 0.20 * targetStrength))
        ctx.fillEllipse(in: CGRect(x: Double(fujiPt.x) - fR, y: Double(fujiPt.y) - fR, width: fR * 2, height: fR * 2))
        ctx.setStrokeColor(rgba(251, 146, 60, 0.70 * targetStrength))
        ctx.setLineWidth(1.6)
        ctx.strokeEllipse(in: CGRect(x: Double(fujiPt.x) - fR, y: Double(fujiPt.y) - fR, width: fR * 2, height: fR * 2))
    }
    let fTri = CGMutablePath()
    fTri.move(to: CGPoint(x: fujiPt.x - 12, y: fujiPt.y + 9))
    fTri.addLine(to: CGPoint(x: fujiPt.x, y: fujiPt.y - 11))
    fTri.addLine(to: CGPoint(x: fujiPt.x + 12, y: fujiPt.y + 9))
    fTri.closeSubpath()
    ctx.setFillColor(targetStrength > 0.1 ? rgba(251, 146, 60, 0.92) : rgba(52, 211, 153, 0.92))
    ctx.addPath(fTri)
    ctx.fillPath()
    ctx.restoreGState()
    drawText(ctx, "富士山", x: Double(fujiPt.x) + 18, y: Double(fujiPt.y) - 2, font: makeHeavyFont(size: 17), color: rgba(235, 245, 255, 0.92), align: .left)
    let fujiSub = (targetStrength > 0.1) ? "地下微動 観測中" : "地下微動 停止確認"
    let fujiSubCol = (targetStrength > 0.1) ? rgba(251, 191, 36, 0.92) : rgba(52, 211, 153, 0.95)
    drawText(ctx, fujiSub, x: Double(fujiPt.x) + 18, y: Double(fujiPt.y) + 18, font: makeFont(size: 13, bold: true), color: fujiSubCol, align: .left)

    // 6. JMSDF Standby Naval Line & Ship Blips inside Suruga Bay
    ctx.saveGState()
    // Defensive standby arc connecting DD units
    ctx.setStrokeColor(rgba(52, 211, 153, 0.30))
    ctx.setLineWidth(1.5)
    ctx.setLineDash(phase: 0, lengths: [6, 5])
    let arcStart = VIEW.toScreen(GeoPoint(lat: 34.75, lon: 138.39))
    let arcMid = VIEW.toScreen(GeoPoint(lat: 34.80, lon: 138.56))
    let arcEnd = VIEW.toScreen(GeoPoint(lat: 34.74, lon: 138.71))
    ctx.move(to: arcStart)
    ctx.addQuadCurve(to: arcEnd, control: arcMid)
    ctx.strokePath()
    ctx.restoreGState()

    for unit in jmsdfUnits {
        let up = VIEW.toScreen(unit.gp)
        ctx.saveGState()
        // Subtle green/emerald tactical diamond (friendly naval unit holding fire)
        let s: CGFloat = unit.isSubmarine ? 6.5 : 8.0
        let diamond = CGMutablePath()
        diamond.move(to: CGPoint(x: up.x, y: up.y - s))
        diamond.addLine(to: CGPoint(x: up.x + s, y: up.y))
        diamond.addLine(to: CGPoint(x: up.x, y: up.y + s))
        diamond.addLine(to: CGPoint(x: up.x - s, y: up.y))
        diamond.closeSubpath()

        ctx.setFillColor(unit.isSubmarine ? rgba(16, 185, 129, 0.32) : rgba(56, 189, 248, 0.32))
        ctx.addPath(diamond)
        ctx.fillPath()
        ctx.setStrokeColor(unit.isSubmarine ? rgba(52, 211, 153, 0.95) : rgba(125, 211, 252, 0.95))
        ctx.setLineWidth(2.0)
        ctx.addPath(diamond)
        ctx.strokePath()

        // Center dot
        ctx.setFillColor(rgba(236, 253, 245, 0.95))
        ctx.fillEllipse(in: CGRect(x: up.x - 2, y: up.y - 2, width: 4, height: 4))
        ctx.restoreGState()
    }

    let fleetLblPt = VIEW.toScreen(GeoPoint(lat: 34.825, lon: 138.56))
    let fleetStatusText = (t >= 21.2) ? "海上自衛隊 展開部隊［攻撃中止・待機継続］" : "海上自衛隊 護衛艦・潜水艦部隊［待機中］"
    drawText(
        ctx, fleetStatusText,
        x: Double(fleetLblPt.x), y: Double(fleetLblPt.y),
        font: makeFont(size: 15, bold: true),
        color: rgba(110, 231, 183, 0.92),
        align: .center,
        strokeColor: rgba(4, 15, 26, 0.90),
        strokeWidth: 4.0
    )

    // 7. THE RED GIANT COLONY TARGET AT SURUGA BAY MOUTH (34.61°N, 138.55°E)
    if targetStrength > 0.005 {
        // Periodic ominous low-frequency acoustic vibration rings (every 1.6s)
        for waveOffset in [0.0, 0.8] {
            let phase = ((t + waveOffset).truncatingRemainder(dividingBy: 1.6)) / 1.6
            let ringR = (14.0 + phase * 82.0) * (0.4 + 0.6 * targetStrength)
            let alpha = (1.0 - phase) * 0.68 * targetStrength
            ctx.saveGState()
            ctx.setStrokeColor(rgba(244, 63, 94, alpha))
            ctx.setLineWidth(2.4)
            ctx.strokeEllipse(in: CGRect(x: Double(targetPt.x) - ringR, y: Double(targetPt.y) - ringR, width: ringR * 2, height: ringR * 2))
            ctx.restoreGState()
        }

        // Throbbing blink / pulse of the giant colony mass
        let blink = 0.68 + 0.32 * sin(t * 5.8)
        let outerGlowR = (38.0 + 7.0 * sin(t * 3.6)) * targetStrength
        let coreR = (17.5 + 3.0 * sin(t * 5.8)) * targetStrength

        // Soft crimson bio-signature glow
        ctx.saveGState()
        let redGrad = CGGradient(
            colorsSpace: colorSpace,
            colors: [
                rgba(255, 70, 90, 0.92 * blink * targetStrength),
                rgba(239, 68, 68, 0.55 * blink * targetStrength),
                rgba(220, 38, 38, 0.0)
            ] as CFArray,
            locations: [0.0, 0.42, 1.0]
        )!
        ctx.drawRadialGradient(
            redGrad,
            startCenter: targetPt, startRadius: 0,
            endCenter: targetPt, endRadius: CGFloat(outerGlowR),
            options: []
        )

        // Organic swarming sub-nodes around the red core (representing a giant colony organism!)
        for k in 0..<8 {
            let ang = Double(k) * (Double.pi / 4.0) + t * 0.7
            let dist = (9.0 + 3.5 * sin(t * 3.1 + Double(k))) * targetStrength
            let nx = Double(targetPt.x) + cos(ang) * dist
            let ny = Double(targetPt.y) + sin(ang) * dist
            let nr = 5.5 * targetStrength
            ctx.setFillColor(rgba(248, 113, 113, 0.78 * blink * targetStrength))
            ctx.fillEllipse(in: CGRect(x: nx - nr, y: ny - nr, width: nr * 2, height: nr * 2))
        }

        // Bright red pulsing core
        ctx.setFillColor(rgba(254, 202, 202, 0.95 * blink * targetStrength))
        ctx.fillEllipse(in: CGRect(x: Double(targetPt.x) - coreR * 0.52, y: Double(targetPt.y) - coreR * 0.52, width: coreR * 1.04, height: coreR * 1.04))
        ctx.setStrokeColor(rgba(239, 68, 68, 0.98 * targetStrength))
        ctx.setLineWidth(2.6)
        ctx.strokeEllipse(in: CGRect(x: Double(targetPt.x) - coreR, y: Double(targetPt.y) - coreR, width: coreR * 2, height: coreR * 2))

        // Tactical target brackets [ + ] around Suruga Bay Mouth
        let brk: Double = 28.0
        let len: Double = 9.0
        let tx = Double(targetPt.x)
        let ty = Double(targetPt.y)
        ctx.setStrokeColor(rgba(251, 113, 133, 0.88 * targetStrength))
        ctx.setLineWidth(2.0)
        // Top-left
        ctx.move(to: CGPoint(x: tx - brk, y: ty - brk + len)); ctx.addLine(to: CGPoint(x: tx - brk, y: ty - brk)); ctx.addLine(to: CGPoint(x: tx - brk + len, y: ty - brk))
        // Top-right
        ctx.move(to: CGPoint(x: tx + brk - len, y: ty - brk)); ctx.addLine(to: CGPoint(x: tx + brk, y: ty - brk)); ctx.addLine(to: CGPoint(x: tx + brk, y: ty - brk + len))
        // Bottom-left
        ctx.move(to: CGPoint(x: tx - brk, y: ty + brk - len)); ctx.addLine(to: CGPoint(x: tx - brk, y: ty + brk)); ctx.addLine(to: CGPoint(x: tx - brk + len, y: ty + brk))
        // Bottom-right
        ctx.move(to: CGPoint(x: tx + brk - len, y: ty + brk)); ctx.addLine(to: CGPoint(x: tx + brk, y: ty + brk)); ctx.addLine(to: CGPoint(x: tx + brk, y: ty + brk - len))
        ctx.strokePath()
        ctx.restoreGState()

        // Target callout placed cleanly in open WSW sea with leader line so it never touches 石廊崎 or whale pod!
        let lblAlpha = clamp(targetStrength * 1.3)
        let callX = Double(targetPt.x) - 66.0
        let callY = Double(targetPt.y) + 26.0
        ctx.saveGState()
        ctx.setStrokeColor(rgba(251, 113, 133, 0.72 * lblAlpha))
        ctx.setLineWidth(1.6)
        ctx.move(to: CGPoint(x: Double(targetPt.x) - 28, y: Double(targetPt.y) + 12))
        ctx.addLine(to: CGPoint(x: callX + 8, y: callY + 4))
        ctx.strokePath()
        ctx.restoreGState()

        drawText(
            ctx, "目標：巨大群体（水深 950m）",
            x: callX, y: callY,
            font: makeHeavyFont(size: 17.5),
            color: rgba(254, 202, 202, lblAlpha),
            align: .right,
            strokeColor: rgba(4, 12, 22, 0.94 * lblAlpha),
            strokeWidth: 4.5
        )
        let subTarget = (t < 15.5) ? "駿河湾口・周期振動を検知中" : "反応急速縮小中…"
        drawText(
            ctx, subTarget,
            x: callX, y: callY + 23,
            font: makeFont(size: 14, bold: true),
            color: rgba(251, 113, 133, lblAlpha),
            align: .right,
            strokeColor: rgba(4, 12, 22, 0.94 * lblAlpha),
            strokeWidth: 4.0
        )
    }

    // 8. EVALUATE & DRAW ALL WHALE SONAR BLIPS (1 Lead White Whale + 115 Following Whales!)
    var activeWhaleCount = 0
    var divingOrArrivedCount = 0
    var whaleStates: [WhaleState] = []
    whaleStates.reserveCapacity(WHALES.count)

    for w in WHALES {
        let st = evaluateWhale(w, at: t)
        whaleStates.append(st)
        if st.visible {
            activeWhaleCount += 1
            if st.diveFrac > 0.1 { divingOrArrivedCount += 1 }
        }
    }

    // Draw following whales first, then Lead White Whale on top so the leader shines clearly!
    for idx in stride(from: whaleStates.count - 1, through: 0, by: -1) {
        let st = whaleStates[idx]
        guard st.visible else { continue }
        let wAgent = WHALES[idx]
        let pt = VIEW.toScreenXY(st.wx, st.wy)

        // Subtle wake trail behind moving whale (drawn from 0.45s earlier position)
        let prevSt = evaluateWhale(wAgent, at: max(wAgent.appearTime, t - 0.55))
        let prevPt = VIEW.toScreenXY(prevSt.wx, prevSt.wy)
        let moveDist = hypot(Double(pt.x - prevPt.x), Double(pt.y - prevPt.y))

        ctx.saveGState()
        if moveDist > 1.5 {
            ctx.setStrokeColor(st.isLeader ? rgba(255, 255, 255, 0.65 * st.alpha) : rgba(56, 189, 248, 0.42 * st.alpha))
            ctx.setLineWidth(st.isLeader ? 2.8 : 1.7)
            ctx.setLineCap(.round)
            ctx.move(to: prevPt)
            ctx.addLine(to: pt)
            ctx.strokePath()
        }

        // Contracting "Dive Ring" as the whale plunges from shallow water into the 950m abyss!
        if st.diveFrac > 0.02 && st.diveFrac < 0.96 {
            let diveRingR = (1.0 - st.diveFrac) * (st.isLeader ? 24.0 : 14.0) + 3.0
            ctx.setStrokeColor(rgba(125, 211, 252, (1.0 - st.diveFrac) * 0.70 * st.alpha))
            ctx.setLineWidth(st.isLeader ? 2.0 : 1.2)
            ctx.strokeEllipse(in: CGRect(x: Double(pt.x) - diveRingR, y: Double(pt.y) - diveRingR, width: diveRingR * 2, height: diveRingR * 2))
        }

        if st.isLeader {
            // Lead White Whale ("先頭の白いクジラ"): larger, pure radiant white-gold/cyan beacon + echolocation ping!
            let pingPhase = ((t - wAgent.appearTime).truncatingRemainder(dividingBy: 1.5)) / 1.5
            if t < 16.5 {
                let pR = 8.0 + pingPhase * 34.0
                ctx.setStrokeColor(rgba(255, 255, 255, (1.0 - pingPhase) * 0.75 * st.alpha))
                ctx.setLineWidth(1.8)
                ctx.strokeEllipse(in: CGRect(x: Double(pt.x) - pR, y: Double(pt.y) - pR, width: pR * 2, height: pR * 2))
            }

            let glowR = 13.0
            ctx.setFillColor(rgba(186, 230, 253, 0.38 * st.alpha))
            ctx.fillEllipse(in: CGRect(x: Double(pt.x) - glowR, y: Double(pt.y) - glowR, width: glowR * 2, height: glowR * 2))

            let dotR = 5.6
            ctx.setFillColor(rgba(255, 255, 255, st.alpha))
            ctx.fillEllipse(in: CGRect(x: Double(pt.x) - dotR, y: Double(pt.y) - dotR, width: dotR * 2, height: dotR * 2))

            // Label the first whale while it leads the pod northward (4.3s -> 13.5s)
            if t >= 4.2 && t < 13.6 {
                let lFade = min(progress(t, 4.2, 4.8), 1.0 - progress(t, 12.9, 13.6))
                drawText(
                    ctx, "先頭のクジラ反応",
                    x: Double(pt.x) + 16, y: Double(pt.y) - 2,
                    font: makeHeavyFont(size: 16),
                    color: rgba(255, 255, 255, lFade),
                    align: .left,
                    strokeColor: rgba(4, 12, 22, 0.90 * lFade),
                    strokeWidth: 4.0
                )
            }
        } else {
            // Following pod whale blip: shifts from bright cyan (surface/mid-water) to crisp ice-white-cyan at 950m overlap!
            let glowR = lerp(6.8, 5.5, st.diveFrac)
            ctx.setFillColor(rgba(56, 189, 248, 0.25 * st.alpha))
            ctx.fillEllipse(in: CGRect(x: Double(pt.x) - glowR, y: Double(pt.y) - glowR, width: glowR * 2, height: glowR * 2))

            let dotR = lerp(3.3, 2.8, st.diveFrac)
            let rC = Int(lerp(103, 224, st.diveFrac))
            let gC = Int(lerp(232, 247, st.diveFrac))
            ctx.setFillColor(rgba(rC, gC, 255, 0.95 * st.alpha))
            ctx.fillEllipse(in: CGRect(x: Double(pt.x) - dotR, y: Double(pt.y) - dotR, width: dotR * 2, height: dotR * 2))
        }
        ctx.restoreGState()
    }

    // Contact flashes right at Target coordinates during intense deep-sea overlap (15.5s -> 20.8s)
    if t >= 15.5 && t <= 20.8 {
        let clashIntensity = sin(progress(t, 15.5, 20.8) * Double.pi)
        let sparkR = (22.0 + 10.0 * sin(t * 14.0)) * clashIntensity
        ctx.saveGState()
        ctx.setStrokeColor(rgba(186, 230, 253, 0.65 * clashIntensity))
        ctx.setLineWidth(2.2)
        ctx.strokeEllipse(in: CGRect(x: Double(targetPt.x) - sparkR, y: Double(targetPt.y) - sparkR, width: sparkR * 2, height: sparkR * 2))
        ctx.restoreGState()
    }

    // Post-elimination status label at Suruga Bay Mouth (t >= 20.8s)
    if t >= 20.8 {
        let clearAlpha = easeOutCubic(progress(t, 20.8, 21.8))
        let callX = Double(targetPt.x) - 52.0
        let callY = Double(targetPt.y) + 22.0
        ctx.saveGState()
        ctx.setStrokeColor(rgba(110, 231, 183, 0.78 * clearAlpha))
        ctx.setLineWidth(1.6)
        ctx.move(to: CGPoint(x: Double(targetPt.x) - 18, y: Double(targetPt.y) + 8))
        ctx.addLine(to: CGPoint(x: callX + 8, y: callY + 4))
        ctx.strokePath()
        ctx.restoreGState()

        drawText(
            ctx, "目標反応 消失 ／ クジラ群のみ探知",
            x: callX, y: callY,
            font: makeHeavyFont(size: 17.5),
            color: rgba(110, 231, 183, clearAlpha),
            align: .right,
            strokeColor: rgba(4, 12, 22, 0.94 * clearAlpha),
            strokeWidth: 4.5
        )
        drawText(
            ctx, "駿河湾口（水深950m）・特有振動 完全停止",
            x: callX, y: callY + 23,
            font: makeFont(size: 14, bold: true),
            color: rgba(167, 243, 208, clearAlpha),
            align: .right,
            strokeColor: rgba(4, 12, 22, 0.94 * clearAlpha),
            strokeWidth: 4.0
        )
    }

    // =========================================================================
    // 9. LEFT TACTICAL SONAR CONSOLE & DEPTH CROSS-SECTION GAUGE
    // =========================================================================
    let panelX = 32.0
    let panelY = 32.0
    let panelW = 404.0
    let panelH = H - 64.0

    fillRoundedRect(
        ctx,
        rect: CGRect(x: panelX, y: panelY, width: panelW, height: panelH),
        radius: 16,
        fill: rgba(7, 18, 30, 0.92),
        stroke: rgba(45, 132, 168, 0.65),
        lineWidth: 1.8
    )

    // Header
    drawText(ctx, "ACOUSTIC & SONAR MONITOR", x: panelX + 22, y: panelY + 30, font: makeMonoFont(size: 13, bold: true), color: rgba(56, 189, 248, 0.85), align: .left, tracking: 1.5)
    drawText(ctx, "駿河湾 深海音響・ソナー監視網", x: panelX + 22, y: panelY + 58, font: makeHeavyFont(size: 22), color: rgba(240, 249, 255, 0.98), align: .left)

    // Divider
    ctx.saveGState()
    ctx.setStrokeColor(rgba(45, 132, 168, 0.35))
    ctx.setLineWidth(1.2)
    ctx.move(to: CGPoint(x: panelX + 20, y: panelY + 82))
    ctx.addLine(to: CGPoint(x: panelX + panelW - 20, y: panelY + 82))
    ctx.strokePath()
    ctx.restoreGState()

    // Legend Box (Symbols explanation so every viewer understands the dots immediately!)
    let legY = panelY + 98.0
    fillRoundedRect(ctx, rect: CGRect(x: panelX + 20, y: legY, width: panelW - 40, height: 138), radius: 12, fill: rgba(11, 27, 43, 0.92), stroke: rgba(38, 98, 128, 0.50), lineWidth: 1.2)
    drawText(ctx, "探知シンボル凡例", x: panelX + 36, y: legY + 22, font: makeFont(size: 13.5, bold: true), color: rgba(148, 195, 218, 0.88), align: .left)

    // Legend 1: Red Target
    ctx.saveGState()
    ctx.setFillColor(rgba(239, 68, 68, 0.95))
    ctx.fillEllipse(in: CGRect(x: panelX + 38, y: legY + 44, width: 14, height: 14))
    ctx.restoreGState()
    drawText(ctx, "未確認巨大群体（駿河湾口・水深950m）", x: panelX + 64, y: legY + 51, font: makeFont(size: 14.5, bold: true), color: rgba(254, 202, 202, 0.95), align: .left)

    // Legend 2: JMSDF Fleet
    ctx.saveGState()
    let ldX = panelX + 45.0, ldY = legY + 83.0
    let dPath = CGMutablePath()
    dPath.move(to: CGPoint(x: ldX, y: ldY - 7)); dPath.addLine(to: CGPoint(x: ldX + 7, y: ldY))
    dPath.addLine(to: CGPoint(x: ldX, y: ldY + 7)); dPath.addLine(to: CGPoint(x: ldX - 7, y: ldY)); dPath.closeSubpath()
    ctx.setStrokeColor(rgba(52, 211, 153, 0.95)); ctx.setLineWidth(2.0); ctx.addPath(dPath); ctx.strokePath()
    ctx.restoreGState()
    drawText(ctx, "海上自衛隊 待機艦艇・潜水艦", x: panelX + 64, y: legY + 83, font: makeFont(size: 14.5, bold: true), color: rgba(167, 243, 208, 0.95), align: .left)

    // Legend 3: Whale Pod Blips
    ctx.saveGState()
    ctx.setFillColor(rgba(255, 255, 255, 1.0))
    ctx.fillEllipse(in: CGRect(x: panelX + 36, y: legY + 110, width: 9, height: 9))
    ctx.setFillColor(rgba(103, 232, 249, 0.95))
    ctx.fillEllipse(in: CGRect(x: panelX + 49, y: legY + 111, width: 7, height: 7))
    ctx.restoreGState()
    drawText(ctx, "マッコウクジラ生体反応（先頭＋後続群）", x: panelX + 64, y: legY + 115, font: makeFont(size: 14.5, bold: true), color: rgba(186, 230, 253, 0.95), align: .left)

    // Live Acoustic Contact Counter Box
    let cntY = legY + 154.0
    fillRoundedRect(ctx, rect: CGRect(x: panelX + 20, y: cntY, width: panelW - 40, height: 112), radius: 12, fill: rgba(11, 27, 43, 0.92), stroke: rgba(38, 98, 128, 0.50), lineWidth: 1.2)
    drawText(ctx, "駿河湾集結 クジラ生体反応数", x: panelX + 36, y: cntY + 26, font: makeFont(size: 14, bold: true), color: rgba(148, 195, 218, 0.90), align: .left)

    let displayWhaleStr: String
    if activeWhaleCount == 0 {
        displayWhaleStr = "0 頭"
    } else if activeWhaleCount == 1 {
        displayWhaleStr = "1 頭（先頭個体）"
    } else if activeWhaleCount >= 100 {
        displayWhaleStr = "100 頭以上"
    } else {
        displayWhaleStr = "\(activeWhaleStrCount(activeWhaleCount)) 頭"
    }
    drawText(ctx, displayWhaleStr, x: panelX + panelW - 36, y: cntY + 68, font: makeHeavyFont(size: 32), color: activeWhaleCount > 0 ? rgba(125, 211, 252, 1.0) : rgba(100, 130, 150, 0.8), align: .right)

    let subCntText = (t >= 13.4) ? "深海潜航・目標座標へ到達中" : (activeWhaleCount > 1 ? "南方海域より続々集結中" : "太平洋側を監視中")
    drawText(ctx, subCntText, x: panelX + 36, y: cntY + 95, font: makeFont(size: 13, bold: true), color: rgba(103, 232, 249, 0.82), align: .left)

    // VERTICAL DEPTH CROSS-SECTION GAUGE (0m -> 1,200m)
    // Visually explains WHY diving whales overlap at the exact same (X,Y) coordinate as the deep-sea target!
    let depY = cntY + 128.0
    let depH = 382.0
    let depX = panelX + 20.0
    let depW = panelW - 40.0
    fillRoundedRect(ctx, rect: CGRect(x: depX, y: depY, width: depW, height: depH), radius: 12, fill: rgba(6, 17, 29, 0.95), stroke: rgba(38, 98, 128, 0.55), lineWidth: 1.2)

    drawText(ctx, "駿河湾口 深度断面モニタ（0〜1,200m）", x: depX + 16, y: depY + 24, font: makeFont(size: 14, bold: true), color: rgba(148, 195, 218, 0.92), align: .left)

    let seaTop = depY + 52.0
    let seaBot = depY + depH - 22.0
    let seaH = seaBot - seaTop
    let seaLeft = depX + 68.0
    let seaRight = depX + depW - 18.0

    // Water column background inside depth monitor
    fillRoundedRect(ctx, rect: CGRect(x: seaLeft, y: seaTop, width: seaRight - seaLeft, height: seaH), radius: 8, fill: rgba(9, 28, 46, 0.95), stroke: rgba(45, 115, 148, 0.40), lineWidth: 1.0)

    // Depth grid lines (0m, 500m, 950m Target Depth, 1200m)
    for (mVal, label) in [(0.0, "0m 海面"), (500.0, "500m"), (950.0, "950m"), (1200.0, "1200m")] {
        let yy = seaTop + (mVal / 1200.0) * seaH
        ctx.saveGState()
        ctx.setStrokeColor(mVal == 950.0 ? rgba(244, 63, 94, 0.35 * targetStrength + 0.15) : rgba(56, 148, 185, 0.22))
        ctx.setLineWidth(1.0)
        ctx.setLineDash(phase: 0, lengths: [4, 4])
        ctx.move(to: CGPoint(x: seaLeft, y: yy))
        ctx.addLine(to: CGPoint(x: seaRight, y: yy))
        ctx.strokePath()
        ctx.restoreGState()
        drawText(ctx, label, x: seaLeft - 8, y: yy, font: makeMonoFont(size: 11.5, bold: true), color: rgba(125, 175, 200, 0.80), align: .right)
    }

    // Target inside depth cross-section at 950m (horizontal center = Target latitude)
    let depTargetX = seaLeft + (seaRight - seaLeft) * 0.36
    let depTargetY = seaTop + (950.0 / 1200.0) * seaH
    if targetStrength > 0.01 {
        let rCore = 14.0 * targetStrength
        let rGlow = 28.0 * targetStrength
        ctx.saveGState()
        ctx.setFillColor(rgba(239, 68, 68, 0.32 * targetStrength))
        ctx.fillEllipse(in: CGRect(x: depTargetX - rGlow, y: depTargetY - rGlow * 0.65, width: rGlow * 2, height: rGlow * 1.3))
        ctx.setFillColor(rgba(248, 113, 113, 0.92 * targetStrength))
        ctx.fillEllipse(in: CGRect(x: depTargetX - rCore, y: depTargetY - rCore * 0.6, width: rCore * 2, height: rCore * 1.2))
        ctx.restoreGState()
    }

    // JMSDF waiting ships at top-left of depth cross-section (North side, shallow/periscope depth)
    for dx in [-36.0, -22.0] {
        ctx.saveGState()
        ctx.setFillColor(rgba(52, 211, 153, 0.90))
        ctx.fillEllipse(in: CGRect(x: depTargetX + dx - 3, y: seaTop + 8, width: 6, height: 6))
        ctx.restoreGState()
    }

    // Whales inside depth cross-section (approaching from right=South at ~50m, then plunging straight down to 950m onto Target!)
    ctx.saveGState()
    ctx.clip(to: CGRect(x: seaLeft, y: seaTop, width: seaRight - seaLeft, height: seaH))
    for st in whaleStates {
        guard st.visible else { continue }
        // Map wy (0 = Target, +65km = South) to horizontal position in depth box
        let normSouth = clamp(st.wy / 62.0, -0.15, 1.0)
        let wxPx = depTargetX + normSouth * (seaRight - depTargetX - 8.0)
        let wyPx = seaTop + (st.depthM / 1200.0) * seaH
        let r = st.isLeader ? 4.2 : 2.3
        ctx.setFillColor(st.isLeader ? rgba(255, 255, 255, st.alpha) : rgba(103, 232, 249, 0.85 * st.alpha))
        ctx.fillEllipse(in: CGRect(x: wxPx - r, y: wyPx - r, width: r * 2, height: r * 2))
    }
    ctx.restoreGState()

    drawText(ctx, "← 北（駿河湾内）", x: seaLeft + 6, y: seaBot - 12, font: makeFont(size: 11, bold: true), color: rgba(110, 160, 185, 0.70), align: .left)
    drawText(ctx, "南（外洋）→", x: seaRight - 6, y: seaBot - 12, font: makeFont(size: 11, bold: true), color: rgba(110, 160, 185, 0.70), align: .right)

    // Bottom Target Status Indicator inside Left Panel
    let statY = depY + depH + 14.0
    let statH = panelY + panelH - statY - 18.0
    let isCleared = (t >= 20.8)
    fillRoundedRect(
        ctx,
        rect: CGRect(x: depX, y: statY, width: depW, height: statH),
        radius: 12,
        fill: isCleared ? rgba(6, 52, 42, 0.92) : rgba(58, 14, 24, 0.90),
        stroke: isCleared ? rgba(52, 211, 153, 0.85) : rgba(244, 63, 94, 0.80),
        lineWidth: 1.6
    )
    let statTitle = isCleared ? "● 目標生体反応：消失・振動停止" : "▲ 目標生体反応：駿河湾口で明滅中"
    let statSub = isCleared ? "クジラ群の潜航接触後、巨大反応の消滅を確認" : (t >= 13.4 ? "クジラ群が一斉潜航し目標座標と重複中" : "水深950mで周期的な地殻刺激振動を発信")
    drawText(ctx, statTitle, x: depX + 18, y: statY + 26, font: makeHeavyFont(size: 16.5), color: isCleared ? rgba(110, 231, 183, 1.0) : rgba(254, 202, 202, 1.0), align: .left)
    drawText(ctx, statSub, x: depX + 18, y: statY + 52, font: makeFont(size: 13.5, bold: true), color: isCleared ? rgba(209, 250, 229, 0.92) : rgba(253, 164, 175, 0.92), align: .left)

    // Live Low-Frequency Vibration Seismograph inside Status Box!
    let waveBoxX = depX + 18.0
    let waveBoxY = statY + 78.0
    let waveBoxW = depW - 36.0
    let waveBoxH = statH - 94.0
    if waveBoxH > 36.0 {
        fillRoundedRect(
            ctx,
            rect: CGRect(x: waveBoxX, y: waveBoxY, width: waveBoxW, height: waveBoxH),
            radius: 8,
            fill: rgba(4, 12, 20, 0.72),
            stroke: isCleared ? rgba(52, 211, 153, 0.35) : rgba(244, 63, 94, 0.35),
            lineWidth: 1.0
        )
        drawText(
            ctx,
            isCleared ? "深海低周波振動・火山性微動：FLAT (0.0Hz)" : "深海低周波振動・火山性微動レベル",
            x: waveBoxX + 12, y: waveBoxY + 18,
            font: makeMonoFont(size: 11, bold: true),
            color: isCleared ? rgba(110, 231, 183, 0.85) : rgba(251, 146, 60, 0.88),
            align: .left
        )

        let midWaveY = waveBoxY + 28.0 + (waveBoxH - 34.0) * 0.5
        let maxAmp = (waveBoxH - 42.0) * 0.46
        let wavePath = CGMutablePath()
        let samples = 90
        for i in 0...samples {
            let u = Double(i) / Double(samples)
            let xx = waveBoxX + 12.0 + u * (waveBoxW - 24.0)
            let envelope = sin(u * Double.pi)
            let rawOsc = sin(u * 28.0 - t * 14.0) * 0.65 + sin(u * 53.0 + t * 21.0) * 0.35
            let yy = midWaveY + rawOsc * maxAmp * envelope * targetStrength
            if i == 0 { wavePath.move(to: CGPoint(x: xx, y: yy)) }
            else { wavePath.addLine(to: CGPoint(x: xx, y: yy)) }
        }
        ctx.saveGState()
        ctx.setStrokeColor(isCleared ? rgba(52, 211, 153, 0.88) : rgba(248, 113, 113, 0.92))
        ctx.setLineWidth(2.0)
        ctx.addPath(wavePath)
        ctx.strokePath()
        ctx.restoreGState()
    }

    // =========================================================================
    // 10. TOP-RIGHT TIMESTAMP & BOTTOM NARRATIVE CAPTION BAR
    // =========================================================================
    let topBadgeW = 330.0
    fillRoundedRect(
        ctx,
        rect: CGRect(x: W - topBadgeW - 32, y: 32, width: topBadgeW, height: 58),
        radius: 12,
        fill: rgba(7, 18, 30, 0.88),
        stroke: rgba(56, 189, 248, 0.45),
        lineWidth: 1.4
    )
    drawText(ctx, "SURUGA BAY / DEPTH SONAR", x: W - topBadgeW - 14, y: 50, font: makeMonoFont(size: 12, bold: true), color: rgba(103, 232, 249, 0.85), align: .left)
    drawText(ctx, "駿河湾口 統合ソナー監視映像", x: W - topBadgeW - 14, y: 73, font: makeFont(size: 15, bold: true), color: rgba(240, 249, 255, 0.95), align: .left)

    // Narrative Caption Pill at Bottom-Center of Map Area
    var caption = ""
    var capAlpha = 0.0
    if t >= 0.5 && t < 4.2 {
        caption = "駿河湾内に自衛隊艦艇が待機する中、駿河湾口の深海で巨大群体が明滅している"
        capAlpha = min(progress(t, 0.5, 1.1), 1.0 - progress(t, 3.7, 4.2))
    } else if t >= 4.2 && t < 8.0 {
        caption = "南の外洋から、まず先頭となる1頭のクジラの反応が出現——"
        capAlpha = min(progress(t, 4.2, 4.7), 1.0 - progress(t, 7.5, 8.0))
    } else if t >= 8.0 && t < 13.5 {
        caption = "先頭の1頭に導かれるように、南から続々とクジラの群れが集結してくる"
        capAlpha = min(progress(t, 8.0, 8.5), 1.0 - progress(t, 13.0, 13.5))
    } else if t >= 13.5 && t < 20.6 {
        caption = "集まったクジラが一斉に深海へ潜水し、次々とターゲットと同じ座標へ重なっていく！"
        capAlpha = min(progress(t, 13.5, 14.0), 1.0 - progress(t, 20.1, 20.6))
    } else if t >= 20.6 {
        caption = "深海でクジラ群と重なり合った巨大群体の反応は縮小・消失し、振動が完全に停止した"
        capAlpha = progress(t, 20.6, 21.3)
    }

    if capAlpha > 0.01 {
        let capFont = makeFont(size: 20, bold: true)
        let m = measureText(caption, font: capFont)
        let cw = Double(m.width) + 52.0
        let ch = 54.0
        let cx = 448.0 + (W - 448.0) * 0.5
        fillRoundedRect(
            ctx,
            rect: CGRect(x: cx - cw * 0.5, y: H - 84.0, width: cw, height: ch),
            radius: 27,
            fill: rgba(5, 14, 24, 0.90 * capAlpha),
            stroke: rgba(103, 232, 249, 0.45 * capAlpha),
            lineWidth: 1.5
        )
        drawText(ctx, caption, x: cx, y: H - 57.0, font: capFont, color: rgba(240, 249, 255, capAlpha), align: .center)
    }

    // Initial smooth fade-in (0.0 -> 0.5s)
    if t < 0.5 {
        ctx.saveGState()
        ctx.setFillColor(rgba(3, 10, 19, 1.0 - t / 0.5))
        ctx.fill(CGRect(x: 0, y: 0, width: W, height: H))
        ctx.restoreGState()
    }
}

func activeWhaleStrCount(_ n: Int) -> Int {
    return n
}

// MARK: - Bitmap Context, PNG Preview & MP4 Video Writer

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
    ctx.translateBy(x: 0, y: CGFloat(height))
    ctx.scaleBy(x: 1.0, y: -1.0)
    return (ctx, rawData, bytesPerRow)
}

func savePNG(_ ctx: CGContext, to url: URL) throws {
    guard let image = ctx.makeImage(),
          let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil) else {
        throw NSError(domain: "SonarVideoGen", code: 1)
    }
    CGImageDestinationAddImage(dest, image, nil)
    if !CGImageDestinationFinalize(dest) {
        throw NSError(domain: "SonarVideoGen", code: 2)
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
            AVVideoAverageBitRateKey: 2_200_000,
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

    guard writer.canAdd(writerInput) else { throw NSError(domain: "SonarVideoGen", code: 10) }
    writer.add(writerInput)
    guard writer.startWriting() else { throw writer.error ?? NSError(domain: "SonarVideoGen", code: 11) }
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

        guard let pool = adaptor.pixelBufferPool else { throw NSError(domain: "SonarVideoGen", code: 12) }
        var pixelBufferOut: CVPixelBuffer?
        guard CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pixelBufferOut) == kCVReturnSuccess,
              let pixelBuffer = pixelBufferOut else {
            throw NSError(domain: "SonarVideoGen", code: 13)
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

        let pts = CMTime(value: CMTimeValue(frame), timescale: FPS)
        if !adaptor.append(pixelBuffer, withPresentationTime: pts) {
            throw writer.error ?? NSError(domain: "SonarVideoGen", code: 14)
        }
    }

    writerInput.markAsFinished()
    let sema = DispatchSemaphore(value: 0)
    writer.finishWriting { sema.signal() }
    sema.wait()

    if writer.status != .completed {
        throw writer.error ?? NSError(domain: "SonarVideoGen", code: 15)
    }
}

// MARK: - CLI Entrypoint

let args = CommandLine.arguments
if let idx = args.firstIndex(of: "--preview-frames"), idx + 1 < args.count {
    let dirURL = URL(fileURLWithPath: args[idx + 1])
    try FileManager.default.createDirectory(at: dirURL, withIntermediateDirectories: true)
    let (ctx, rawData, _) = createBitmapContext()
    defer { rawData.deallocate() }

    let sampleTimes: [Double] = [2.0, 5.5, 9.8, 12.8, 15.8, 18.8, 22.5]
    for (i, t) in sampleTimes.enumerated() {
        ctx.saveGState()
        renderFrame(ctx, time: t)
        ctx.restoreGState()
        let out = dirURL.appendingPathComponent(String(format: "sonar_%02d_t%.1fs.png", i + 1, t))
        try savePNG(ctx, to: out)
        print("Saved preview: \(out.path)")
    }
} else {
    let outPath: String
    if let idx = args.firstIndex(of: "--output"), idx + 1 < args.count {
        outPath = args[idx + 1]
    } else {
        outPath = "assets/scenarios/project-deep-sea/releases/videos/day7_suruga_sonar_convergence.mp4"
    }
    print("Encoding 1920x1080 30fps MP4 to \(outPath) ...")
    try encodeMP4(to: URL(fileURLWithPath: outPath))
    print("Done: \(outPath)")
}
