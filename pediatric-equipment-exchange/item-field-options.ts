
// saving the item fields as their own type and defining constants for their values

export const CONDITION_OPTIONS = [
    "Excellent",
    "Good",
    "Acceptable",
    "Needs Cleaning",
    "Broken/Missing Pieces"
] as const;

export const CATEGORY_OPTIONS = [
    "Stander",
    "Wheelchair",
    "Medical Stroller",
    "Activity Chair",
    "Walker",
    "Gait Trainer",
    "Forearm Crutches",
    "Adaptive Tricycle",
    "Adaptive Tray",
    "Walking Frame",
    "Guardian",
    "Pacer",
    "Other"
] as const;

export const SUBCATEGORY_OPTIONS = [
    "Supine",
    "Prone",
    "Posterior",
    "Multi",
    "Mobile",
    "Manual Rigid",
    "Manual Folding",
    "Sport",
    "Power"
] as const;

export const STATUS_OPTIONS = [
    "Available",
    "In Processing",
    "Reserved",
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