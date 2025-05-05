import "./Raiting.css";
import { useState, useEffect } from "react";
const RatingDisplay = ({ currentRating, previousRating }) => {
  const svg_up_arrow = (
    <svg viewBox="0 -4.5 20 20" transform="rotate(270)">
      <g id="SVGRepo_bgCarrier" stroke-width="0" />

      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <g id="SVGRepo_iconCarrier">
        <g id="Page-1" fill-rule="evenodd">
          {" "}
          <g
            id="Dribbble-Light-Preview"
            transform="translate(-300.000000, -6643.000000)"
            // fill="#000000" удалить этот атрибут
          >
            {" "}
            <g id="icons" transform="translate(56.000000, 160.000000)">
              {" "}
              <polygon
                id="arrow_right-[#346]"
                points="264 6488.26683 258.343 6483 256.929 6484.21678 260.172 6487.2264 244 6487.2264 244 6489.18481 260.172 6489.18481 256.929 6492.53046 258.343 6494"
              >
                {" "}
              </polygon>{" "}
            </g>{" "}
          </g>{" "}
        </g>{" "}
      </g>
    </svg>
  );

  const svg_down_arrow = (
    <svg viewBox="0 -4.5 20 20" transform="rotate(90)">
      <g id="SVGRepo_bgCarrier" stroke-width="0" />

      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <g id="SVGRepo_iconCarrier">
        <g id="Page-1" fill-rule="evenodd">
          {" "}
          <g
            id="Dribbble-Light-Preview"
            transform="translate(-300.000000, -6643.000000)"
            // fill="#000000" удалить этот атрибут
          >
            {" "}
            <g id="icons" transform="translate(56.000000, 160.000000)">
              {" "}
              <polygon
                id="arrow_right-[#346]"
                points="264 6488.26683 258.343 6483 256.929 6484.21678 260.172 6487.2264 244 6487.2264 244 6489.18481 260.172 6489.18481 256.929 6492.53046 258.343 6494"
              >
                {" "}
              </polygon>{" "}
            </g>{" "}
          </g>{" "}
        </g>{" "}
      </g>
    </svg>
  );
  const svg_minus = (
    <svg viewBox="0 0 24 24">
      <path
        d="M6 12L18 12"
        stroke="#000000"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );

  const [arrowIcon, setArrwIcon] = useState(svg_minus);
  const [textColor, setTextColor] = useState("text-gray-400");
  const change = currentRating - previousRating;
  const changePercentage =
    previousRating !== 0 ? ((change / previousRating) * 100).toFixed(1) : 0;

  useEffect(() => {
    if (change > 0) {
      setArrwIcon(svg_up_arrow);
      setTextColor("text_green_500");
    } else if (change < 0) {
      setArrwIcon(svg_down_arrow);
      setTextColor("text_red_500");
    } else {
      setArrwIcon(svg_minus);
      setTextColor("text-gray-400");
    }
  }, [change]);

  return (
    <div className="raiting_block">
      <span className="current_raiting">{currentRating}</span>
      <div className="progress">
        <div className={`${textColor}`}> {arrowIcon}</div>

        <span className={`${textColor}`}>
          {change !== 0 ? `${Math.abs(changePercentage)}%` : "0%"}
        </span>
      </div>
    </div>
  );
};

export default RatingDisplay;
