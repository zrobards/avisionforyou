"use client";

import { useState } from "react";
import Select from "react-select";

interface SkillsSelectorProps {
  value: string[];
  onChange: (skills: string[]) => void;
}

const SUGGESTED_SKILLS = [
  "UI/UX Design",
  "Graphic Design",
  "Web Design",
  "Motion Graphics",
  "Branding",
  "Illustration",
  "Typography",
  "Prototyping",
  "User Research",
  "Wireframing",
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Figma",
  "Sketch",
  "After Effects",
  "3D Design",
  "Print Design",
  "Logo Design",
];

export function SkillsSelector({ value, onChange }: SkillsSelectorProps) {
  const options = SUGGESTED_SKILLS.map((skill) => ({
    value: skill,
    label: skill,
  }));

  const selectedOptions = value.map((skill) => ({
    value: skill,
    label: skill,
  }));

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Skills
      </label>
      <Select
        isMulti
        value={selectedOptions}
        onChange={(newValue) => {
          onChange(newValue.map((option) => option.value));
        }}
        options={options}
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder="Select or type to add skills..."
        styles={{
          control: (base, state) => ({
            ...base,
            backgroundColor: "rgb(15 23 42)", // slate-900
            borderColor: state.isFocused
              ? "rgb(34 211 238)" // cyan-400
              : "rgb(71 85 105)", // slate-600
            "&:hover": {
              borderColor: "rgb(100 116 139)", // slate-500
            },
            boxShadow: state.isFocused ? "0 0 0 1px rgb(34 211 238)" : "none",
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: "rgb(15 23 42)", // slate-900
            border: "1px solid rgb(71 85 105)", // slate-600
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
              ? "rgb(30 41 59)" // slate-800
              : "transparent",
            color: "rgb(203 213 225)", // slate-300
            "&:active": {
              backgroundColor: "rgb(30 41 59)",
            },
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: "rgb(6 182 212)", // cyan-500
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: "white",
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: "white",
            "&:hover": {
              backgroundColor: "rgb(8 145 178)", // cyan-600
              color: "white",
            },
          }),
          input: (base) => ({
            ...base,
            color: "rgb(203 213 225)", // slate-300
          }),
          placeholder: (base) => ({
            ...base,
            color: "rgb(148 163 184)", // slate-400
          }),
        }}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: "rgb(34 211 238)", // cyan-400
            primary25: "rgb(30 41 59)", // slate-800
            primary50: "rgb(30 41 59)", // slate-800
            danger: "rgb(239 68 68)", // red-500
            dangerLight: "rgb(220 38 38)", // red-600
          },
        })}
      />
      <p className="mt-1 text-xs text-slate-500">
        Select from suggestions or type to add custom skills
      </p>
    </div>
  );
}




