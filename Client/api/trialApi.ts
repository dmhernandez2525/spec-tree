import axios from 'axios';
import { TrialStatus, TrialConversion } from '@/types/trial';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function startTrial(planId: string): Promise<TrialStatus> {
  try {
    const response = await axios.post(`${API_URL}/api/trials/start`, {
      planId,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to start trial:', error);
    throw error;
  }
}

export async function getTrialStatus(): Promise<TrialStatus> {
  try {
    const response = await axios.get(`${API_URL}/api/trials/status`);
    return response.data;
  } catch (error) {
    console.error('Failed to get trial status:', error);
    throw error;
  }
}

export async function endTrial(trialId: string): Promise<void> {
  try {
    await axios.post(`${API_URL}/api/trials/${trialId}/end`);
  } catch (error) {
    console.error('Failed to end trial:', error);
    throw error;
  }
}

export async function convertTrial(
  trialId: string,
  conversionData: Omit<TrialConversion, 'trialId'>
): Promise<void> {
  try {
    await axios.post(
      `${API_URL}/api/trials/${trialId}/convert`,
      conversionData
    );
  } catch (error) {
    console.error('Failed to convert trial:', error);
    throw error;
  }
}

export async function extendTrial(
  trialId: string,
  daysToExtend: number
): Promise<TrialStatus> {
  try {
    const response = await axios.post(
      `${API_URL}/api/trials/${trialId}/extend`,
      { days: daysToExtend }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to extend trial:', error);
    throw error;
  }
}
