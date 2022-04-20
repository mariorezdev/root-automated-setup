import {
  ActionReducerMapBuilder,
  createSlice,
  Draft,
  PayloadAction,
} from "@reduxjs/toolkit";
import content from "../components/content.json";
import { AppThunk, RootState } from "../components/store";
import {
  expansionEnabled,
  getExpansionConfig,
  persistExpansionEnabled,
  selectComponentArray,
} from "./reduxUtils";
import { ComponentState, Expansion, ExpansionComponent } from "../types";

let initialState: ComponentState<Expansion> = {};
for (const [expansionCode, expansion] of Object.entries(content)) {
  initialState[expansionCode] = {
    base: expansion.base,
    image: expansion.image === "" ? undefined : expansion.image,
    enabled: expansionEnabled(expansionCode, expansion.base),
  };
}

/** Redux Selector for returning a specified Expansion from state */
export const selectExpansion = (state: RootState, code: string) =>
  state.expansion[code];

/** Redux Selector for returning the expansion list as an array, moving the object key to the object field "code" */
export const selectExpansionArray = selectComponentArray(
  (state) => state.expansion
);

const setExpansionEnabled = (
  state: ComponentState<Expansion>,
  expansionCode: string,
  enabled: boolean
) => {
  // Retreive the expansion (may return undefined if code does not exist)
  const expansion = state[expansionCode];
  // Only update the expansion state if it exists and is not the base game
  if (expansion != null && !expansion.base) {
    expansion.enabled = enabled;
    persistExpansionEnabled(expansionCode, expansion.enabled);
  }
};

export const expansionSlice = createSlice({
  name: "expansion",
  initialState,
  reducers: {
    enableExpansion: (state, action: PayloadAction<string>) =>
      setExpansionEnabled(state, action.payload, true),
    disableExpansion: (state, action: PayloadAction<string>) =>
      setExpansionEnabled(state, action.payload, false),
  },
});

export const { enableExpansion, disableExpansion } = expansionSlice.actions;
export default expansionSlice.reducer;

/** Function for adding automatic enable/disable expansion reducers to a redux slice */
export const expansionReducers = <T extends ExpansionComponent>(
  builder: ActionReducerMapBuilder<ComponentState<T>>,
  addExpansionComponents: (
    state: Draft<ComponentState<T>>,
    expansionCode: string
  ) => void
) => {
  builder
    .addCase(enableExpansion, (state, action) =>
      addExpansionComponents(state, action.payload)
    )
    .addCase(disableExpansion, (state, action) => {
      // Skip processing for the base game, as that cannot be disabled
      if (!getExpansionConfig(action.payload)?.base) {
        // Remove all components matching the disabled expansion
        for (const [componentCode, component] of Object.entries(state)) {
          if (component.expansionCode === action.payload) {
            delete state[componentCode];
          }
        }
      }
    });
};

/** Thunk for toggling an expansion, dispatching either the enableExpansion or disableExpansion action */
export const toggleExpansion =
  (expansionCode: string): AppThunk =>
  (dispatch, getState) => {
    // Retreive the expansion (may return undefined if code does not exist)
    const expansion = selectExpansion(getState(), expansionCode);
    // Only update the expansion state if it exists and is not the base game
    if (expansion != null && !expansion.base) {
      // Dispatch action to invert current state. We need to do this so all slices can react to the expansion state change
      if (expansion.enabled) {
        dispatch(disableExpansion(expansionCode));
      } else {
        dispatch(enableExpansion(expansionCode));
      }
    }
  };
