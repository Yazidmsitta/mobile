/**
 * Calculate ring/bracelet measurements
 */

export const MeasurementType = {
  RING: 'ring',
  BRACELET: 'bracelet',
  FINGER: 'finger',
};

/**
 * Calculate measurements from diameter in mm
 */
export const calculateFromDiameter = (diameterMm) => {
  const circumferenceMm = Math.PI * diameterMm;
  const sizeEu = diameterMm;
  const sizeUs = diameterMm / 25.4 * 10; // Convert mm to US size

  return {
    diameterMm: parseFloat(diameterMm.toFixed(2)),
    circumferenceMm: parseFloat(circumferenceMm.toFixed(2)),
    sizeEu: parseFloat(sizeEu.toFixed(1)),
    sizeUs: parseFloat(sizeUs.toFixed(1)),
  };
};

/**
 * Calculate measurements from circumference in mm
 */
export const calculateFromCircumference = (circumferenceMm) => {
  const diameterMm = circumferenceMm / Math.PI;
  return calculateFromDiameter(diameterMm);
};

/**
 * Calculate measurements from US size
 */
export const calculateFromUsSize = (sizeUs) => {
  const diameterMm = (sizeUs / 10) * 25.4;
  return calculateFromDiameter(diameterMm);
};

/**
 * Calculate measurements from EU size
 */
export const calculateFromEuSize = (sizeEu) => {
  return calculateFromDiameter(sizeEu);
};

/**
 * Calculate measurements using reference object (coin calibration)
 * @param {number} ringRadiusPx - Radius of ring in pixels
 * @param {number} referenceRadiusPx - Radius of reference object (coin) in pixels
 * @param {number} referenceDiameterMm - Known diameter of reference object in mm
 */
export const calculateFromReference = (ringRadiusPx, referenceRadiusPx, referenceDiameterMm) => {
  if (referenceRadiusPx === 0) {
    throw new Error('Reference radius cannot be zero');
  }
  
  const scaleFactor = referenceDiameterMm / (2 * referenceRadiusPx);
  const ringDiameterMm = (2 * ringRadiusPx) * scaleFactor;
  
  return calculateFromDiameter(ringDiameterMm);
};

/**
 * Get size recommendations based on measurement
 */
export const getSizeRecommendation = (sizeEu, type = MeasurementType.RING) => {
  const recommendations = {
    [MeasurementType.RING]: {
      small: { min: 0, max: 15, label: 'Petite' },
      medium: { min: 15, max: 18, label: 'Moyenne' },
      large: { min: 18, max: 25, label: 'Grande' },
    },
    [MeasurementType.BRACELET]: {
      small: { min: 0, max: 16, label: 'Petit' },
      medium: { min: 16, max: 18, label: 'Moyen' },
      large: { min: 18, max: 22, label: 'Grand' },
    },
  };

  const ranges = recommendations[type] || recommendations[MeasurementType.RING];
  
  for (const range of Object.values(ranges)) {
    if (sizeEu >= range.min && sizeEu < range.max) {
      return range.label;
    }
  }
  
  return 'Grande';
};


