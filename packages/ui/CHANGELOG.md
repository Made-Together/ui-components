# @repo/ui

## 0.3.3

### Patch Changes

- 0c80b29: Updated default behaviour of <NumberFlow /> component; it now uses 'continuous' plugin by default. It also now accepts a new prop called 'animateInView' which allows you to animate the number when it is in view.
- 2ed2169: Added SKILLS.md guidelines for the repo; included rules for all components.

## 0.3.2

### Patch Changes

- Improved bundle size by using `<LazyMotion />`. Refactored inner component functionalities for better performance.

## 0.3.1

### Patch Changes

- 0b7da99: Added internal component documentation along with links to main documentation website.
- 0b7da99: Improved internal package documentation.

## 0.3.0

### Minor Changes

- 9f1ef67: Expanded <Tabs /> component functionality. It now supports autoplay functionality along with loop, delay timer and progress tracking.

### Patch Changes

- 08bf72e: Expanded inline styling for vertical progress tracking on the <Tabs /> component. Enhanced documentation and examples to showcase new features.

## 0.2.1

### Patch Changes

- fdb7802: Improved internal package documentation.

## 0.2.0

### Minor Changes

- 810ae6a: Updated default values handling for gap and duration in `<Marquee />` component, messing with tailwind directed css values.

### Patch Changes

- e98eb22: Enhanced `<Accordion.Indicator /> component with state-based content rendering and improved CSS transitions.
- ceb0b69: Implemented additional default behaviour on the `<Carousel />` component.

  It now fully supports horizontal mouse scrolling.

  Also, fixed autoplay behaviour on user interaction - it now resets the autoplay timer for the next slide after user interaction.

## 0.1.0

### Minor Changes

- ac1ab8d: Extended the functionality of <TextReveal /> component; it now supports percentage progress that is programatically accessible.
- 94e8302: Implemented <TextReveal /> component.
- 4bf83df: TypeAhead component implementated.
