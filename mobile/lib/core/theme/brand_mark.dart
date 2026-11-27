import 'dart:math' as math;
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'app_theme.dart';

/// Vector-rendered VectorGallery "Living Matter" Fold & Orbit emblem matching `public/vectorgallery-icon.svg`.
class VectorGalleryBrandMark extends StatelessWidget {
  final double size;

  const VectorGalleryBrandMark({super.key, this.size = 32});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _BrandMarkPainter(),
      ),
    );
  }
}

class _BrandMarkPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 64.0;
    canvas.save();
    canvas.scale(s, s);

    // 1. Rounded Obsidian Squircle
    final sq = RRect.fromRectAndRadius(const Rect.fromLTWH(2, 2, 60, 60), const Radius.circular(16));
    final bgPaint = Paint()
      ..shader = ui.Gradient.linear(
        const Offset(6, 4),
        const Offset(58, 60),
        [const Color(0xFF171C21), const Color(0xFF0E1115), const Color(0xFF07090B)],
        [0.0, 0.55, 1.0],
      );
    canvas.drawRRect(sq, bgPaint);

    // 2. Luminous Aura inside squircle
    final auraPaint = Paint()
      ..shader = ui.Gradient.radial(
        const Offset(40, 24),
        36,
        [
          const Color(0x47CDFF45),
          const Color(0x1F46D6A4),
          const Color(0x00090B0D),
        ],
        [0.0, 0.48, 1.0],
      );
    canvas.drawRRect(sq, auraPaint);

    // 3. Gradient Rim Stroke
    final rimPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.6
      ..shader = ui.Gradient.linear(
        const Offset(8, 6),
        const Offset(56, 58),
        [
          const Color(0x73E3E8EA),
          const Color(0x3846D6A4),
          const Color(0x61CDFF45),
        ],
        [0.0, 0.5, 1.0],
      );
    canvas.drawRRect(sq, rimPaint);

    // 4. Delicate Tilted Orbital Hairline
    canvas.save();
    canvas.translate(32, 33);
    canvas.rotate(-24 * math.pi / 180.0);
    final orbitPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.35
      ..color = const Color(0x5CE3E8EA);
    canvas.drawOval(Rect.fromCenter(center: Offset.zero, width: 45.0, height: 16.8), orbitPaint);
    canvas.restore();

    // 5. Left Liquid Titanium Silver Fold
    final leftFold = Path()
      ..moveTo(15.4, 17.6)
      ..lineTo(22.8, 14.8)
      ..quadraticBezierTo(26.1, 13.6, 27.5, 17.0)
      ..lineTo(35.8, 40.0)
      ..quadraticBezierTo(37.1, 43.6, 33.6, 45.0)
      ..lineTo(27.6, 47.3)
      ..quadraticBezierTo(24.1, 48.6, 22.8, 45.2)
      ..lineTo(13.5, 22.4)
      ..quadraticBezierTo(12.1, 18.8, 15.4, 17.6)
      ..close();

    final silverPaint = Paint()
      ..shader = ui.Gradient.linear(
        const Offset(12, 14),
        const Offset(34, 50),
        [const Color(0xFFF7F9FA), const Color(0xFFDCE3E6), const Color(0xFF8C99A0)],
        [0.0, 0.52, 1.0],
      );
    canvas.drawPath(leftFold, silverPaint);

    // 6. Right Volt-Lime / Emerald Fold
    final rightFold = Path()
      ..moveTo(41.2, 14.8)
      ..lineTo(48.6, 17.6)
      ..quadraticBezierTo(51.9, 18.8, 50.5, 22.4)
      ..lineTo(41.2, 45.2)
      ..quadraticBezierTo(39.9, 48.6, 36.4, 47.3)
      ..lineTo(30.4, 45.0)
      ..quadraticBezierTo(26.9, 43.6, 28.2, 40.0)
      ..lineTo(36.5, 17.0)
      ..quadraticBezierTo(37.9, 13.6, 41.2, 14.8)
      ..close();

    final voltPaint = Paint()
      ..shader = ui.Gradient.linear(
        const Offset(30, 13),
        const Offset(48, 49),
        [const Color(0xFFD9FF66), const Color(0xFFCDFF45), const Color(0xFF087F5B)],
        [0.0, 0.45, 1.0],
      );
    canvas.drawPath(rightFold, voltPaint);

    // 7. Apex Core Prism
    final prism = Path()
      ..moveTo(32.0, 33.4)
      ..lineTo(35.8, 39.8)
      ..lineTo(32.0, 46.2)
      ..lineTo(28.2, 39.8)
      ..close();
    canvas.drawPath(prism, Paint()..color = const Color(0xF5ECFF9E));

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Website-aligned horizontal brand lockup (`VectorGallery` + `PERSONAL CLOUD`).
class VectorGalleryBrandLockup extends StatelessWidget {
  final double markSize;
  final bool showSubtitle;

  const VectorGalleryBrandLockup({
    super.key,
    this.markSize = 30,
    this.showSubtitle = true,
  });

  @override
  Widget build(BuildContext context) {
    final primary = AppTheme.textPrimaryOf(context);
    final secondary = AppTheme.textSecondaryOf(context);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        VectorGalleryBrandMark(size: markSize),
        const SizedBox(width: 9),
        Flexible(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'VectorGallery',
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 16,
                  letterSpacing: -0.4,
                  height: 1.05,
                  color: primary,
                ),
              ),
              if (showSubtitle)
                Text(
                  'PERSONAL CLOUD',
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 9,
                    letterSpacing: 1.1,
                    fontWeight: FontWeight.w600,
                    color: secondary,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

