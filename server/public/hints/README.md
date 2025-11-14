# Hint Images Folder Structure

This directory contains hint images organized by folders. Each hint has its own folder containing multiple images.

## Folder Structure

```
hints/
├── hint1/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── image3.png
├── hint2/
│   ├── clue1.jpg
│   └── clue2.jpg
├── hint3/
│   ├── puzzle_part1.png
│   ├── puzzle_part2.png
│   └── puzzle_part3.png
├── hint4/
│   └── single_image.jpg
├── hint5/
├── hint6/
├── hint7/
└── final_hint/
    ├── final1.jpg
    └── final2.jpg
```

## Image Requirements

- **Supported formats**: JPG, JPEG, PNG, GIF, WEBP
- **Naming**: Images are sorted alphabetically (use prefixes like `01_`, `02_` for specific order)
- **Mobile optimization**: Recommended max width 1200px, compress for faster loading
- **Aspect ratio**: Any aspect ratio works, but 16:9 or 4:3 recommended for mobile viewing

## Database Configuration

In the database, each hint has a `folderName` field:

```json
{
  "hint_id": 1,
  "folderName": "hint1",
  "correctPins": ["library"],
  "isFinalHint": false
}
```

The system will automatically:

1. Read all image files from the specified folder
2. Sort them alphabetically
3. Display them in a mobile-optimized carousel
4. Allow users to swipe/navigate between images

## Frontend Features

- **Carousel navigation**: Swipe or use arrow buttons to view all images
- **Thumbnail strip**: Quick navigation between images
- **Image counter**: Shows current position (e.g., "2 / 5")
- **Download**: Download individual images for offline viewing
- **Mobile-first**: Touch-optimized controls, full viewport height support
