export function circularMean(angles) {
  if (!angles || angles.length === 0) return 0;

  let sinSum = 0;
  let cosSum = 0;

  for (const angle of angles) {
    const rad = (angle * Math.PI) / 180;
    sinSum += Math.sin(rad);
    cosSum += Math.cos(rad);
  }

  sinSum /= angles.length;
  cosSum /= angles.length;

  let meanRad = Math.atan2(sinSum, cosSum);
  let meanDeg = (meanRad * 180) / Math.PI;

  return ((meanDeg % 360) + 360) % 360;
}

export function circularDifference(point, reference) {
  const diff = ((point - reference + 540) % 360) - 180;
  return diff;
}

export function recenterWindDirection(data, windowSize = 100) {
  if (!data || data.length === 0) return data;

  const recentered = [];

  for (let i = 0; i < data.length; i++) {
    const startIdx = Math.max(0, i - windowSize);
    const window = data.slice(startIdx, i + 1);

    const directions = window
      .map(d => d.windDirection)
      .filter(d => d != null);

    if (directions.length === 0) {
      recentered.push({
        ...data[i],
        windDirectionCentered: data[i].windDirection,
        rollingReference: data[i].windDirection,
      });
      continue;
    }

    const reference = circularMean(directions);
    const centered = circularDifference(data[i].windDirection, reference);

    recentered.push({
      ...data[i],
      windDirectionCentered: centered,
      rollingReference: reference,
    });
  }

  return recentered;
}
