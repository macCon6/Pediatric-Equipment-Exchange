
// saving the item fields as their own type and defining constants for their values

export const CONDITION_OPTIONS = [
    "Excellent",
    "Acceptable",
    "Needs Cleaning",
    "Broken/Missing Pieces"
] as const;

export const CATEGORY_OPTIONS = [
    "Stander",
    "Wheelchair",
    "Walker",
    "Medical Stroller",
    "Gait Trainer/Supported Stepping Device",
    "Standard Crutches",
    "Forearm Crutches",
    "Activity Chair",
    "Bath Equipment",
    "Shower Chair",
    "Toilet Chair",
    "Adaptive Tricycle/Bicycle",
    "Adaptive Tray",
    "Walking Frame",
    "Sleep Positioner",
    "Toddler Mobility Trainer",
    "Adaptive Swing",
    "Other"
] as const;

export const SUBCATEGORY_OPTIONS = [
    "Supine",
    "Prone",
    "Posterior",
    "Mobile",
    "Multi-Position",
    "Manual Tilt-in-Space",
    "Manual Reclining",
    "Manual Rigid",
    "Manual Folding",
    "Manual E-Assist",
    "Sport",
    "Power",
    "Hand-Propelled Only",
    "Foot-Propelled Only",
    "Hand-and-Foot Propelled"
] as const;

export const STATUS_OPTIONS = [
    "Available",
    "In Processing",
    "Reserved - Needs Signature",
    "Reserved - Ready for Pickup",
    "Allocated"
] as const;

export const COLOR_OPTIONS = [
    "Red",
    "Orange",
    "Green",
    "Blue",
    "Yellow",
    "Purple",
    "Pink",
    "Black",
    "Brown",
    "White",
    "Silver",
    "Gold",
    "Tan",
    "Gray"
] as const;

export type Condition = typeof CONDITION_OPTIONS[number];
export type Category = typeof CATEGORY_OPTIONS[number];
export type Subcategory = typeof SUBCATEGORY_OPTIONS[number];
export type Status = typeof STATUS_OPTIONS[number];
export type Color = typeof COLOR_OPTIONS[number];