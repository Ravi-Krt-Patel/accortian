Build a React Accordion component that allows users to expand and collapse sections of content. When a section is clicked, it should toggle its visibility. If a new section is clicked, it should expand while the others collapse (i.e., only one section is open at a time).

Requirements
Display a list of accordion items, each with a title and content.
Clicking on a title expands its content and collapses any previously opened item.
If an already open item is clicked, it should collapse.
The component should accept an array of items as props. Each item contains:
title: The heading of the accordion item.
content: The details inside the accordion item.
The component should handle edge cases such as an empty list or invalid input by displaying a message "No items available".
Constraints & Edge Cases
The items prop should be an array of objects { title: string, content: string }.
If items is empty, display a message like "No items available."
Optimize performance by using React’s useState and conditional rendering.