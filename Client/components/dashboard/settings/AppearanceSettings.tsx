import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFonts, styleFonts } from '@/components/FontManager';
import { toast } from 'sonner';
import Theme from '@/components/dashboard/theme';

// Get style variants from FontManager's styleFonts keys
const styleVariantKeys = Object.keys(styleFonts) as [keyof typeof styleFonts, ...Array<keyof typeof styleFonts>];

const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  fontSize: z.enum(['small', 'medium', 'large']),
  style: z.enum(styleVariantKeys),
  animationsEnabled: z.boolean(),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

export function AppearanceSettings() {
  const { currentStyle, setCurrentStyle } = useFonts();

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: 'system',
      fontSize: 'medium',
      style: currentStyle,
      animationsEnabled: true,
    },
  });

  function onSubmit(data: AppearanceFormValues) {
    setCurrentStyle(data.style);
    toast.success('Appearance settings updated');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize how Spec Tree looks on your device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Theme />
            <Button type="submit">Save Preferences</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
