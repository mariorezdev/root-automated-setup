import { useTranslation } from "react-i18next";
import { useAppSelector } from "../hooks";
import { selectFactionPool, selectFlowState } from "../features/selectors";
import classNames from "classnames";

interface StatBarProps {
  stat: "complexity" | "wealth" | "aggression" | "crafting";
}

export const StatBar: React.FC<StatBarProps> = ({ stat }) => {
  const { currentFactionIndex } = useAppSelector(selectFlowState);
  const factionPool = useAppSelector(selectFactionPool);
  const { t } = useTranslation();

  const statValue = currentFactionIndex != null ? factionPool[currentFactionIndex][stat] : 0;
  return (
    <div className="stat">
      <span className="label">{t("label." + stat)}</span>
      <span
        className={classNames({
          low: statValue < 1,
          moderate: statValue === 1,
          high: statValue > 1,
        })}
      >
        {t("label.factionRating." + statValue)}
      </span>
    </div>
  );
};

export default StatBar;
