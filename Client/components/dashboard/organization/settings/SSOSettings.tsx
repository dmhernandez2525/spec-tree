import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { useAppDispatch } from '@/lib/hooks/use-store';
import { updateSSOConfig } from '@/lib/store/settings-slice';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/shared/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Plus } from 'lucide-react';

const ssoProviders = [
  { id: 'azure', name: 'Microsoft Azure AD', icon: 'microsoft' },
  { id: 'google', name: 'Google Workspace', icon: 'google' },
  { id: 'okta', name: 'Okta', icon: 'okta' },
  { id: 'custom', name: 'Custom SAML', icon: 'code' },
] as const;

const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/;

const ssoConfigSchema = z.object({
  provider: z.enum(['azure', 'google', 'okta', 'custom']),
  enabled: z.boolean(),
  enforceSSO: z.boolean(),
  allowEmailLogin: z.boolean(),
  config: z.object({
    entityId: z.string().min(1, 'Entity ID is required'),
    ssoUrl: z.string().url('Must be a valid URL'),
    certificateData: z.string().min(1, 'Certificate data is required'),
  }),
  domainRestrictions: z.array(
    z.object({
      domain: z.string().regex(domainRegex, 'Must be a valid domain (e.g., example.com)'),
    })
  ),
});

type SSOConfigFormData = z.infer<typeof ssoConfigSchema>;

export function SSOSettings() {
  const dispatch = useAppDispatch();
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [newDomain, setNewDomain] = useState('');

  const form = useForm<SSOConfigFormData>({
    resolver: zodResolver(ssoConfigSchema),
    defaultValues: {
      provider: 'azure',
      enabled: false,
      enforceSSO: false,
      allowEmailLogin: true,
      config: {
        entityId: '',
        ssoUrl: '',
        certificateData: '',
      },
      domainRestrictions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'domainRestrictions',
  });

  const handleAddDomain = () => {
    if (newDomain && domainRegex.test(newDomain)) {
      const exists = fields.some((field) => field.domain === newDomain);
      if (!exists) {
        append({ domain: newDomain });
        setNewDomain('');
      } else {
        toast.error('Domain already exists');
      }
    } else {
      toast.error('Please enter a valid domain (e.g., example.com)');
    }
  };

  async function onSubmit(data: SSOConfigFormData) {
    setIsConfiguring(true);
    try {
      // Transform domain restrictions from form format to API format
      const transformedData = {
        ...data,
        domainRestrictions: data.domainRestrictions.map((d) => d.domain),
      };
      await dispatch(updateSSOConfig(transformedData)).unwrap();
      toast.success('SSO configuration updated successfully');
    } catch {
      toast.error('Failed to update SSO configuration');
    } finally {
      setIsConfiguring(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Single Sign-On (SSO)</CardTitle>
          <CardDescription>
            Configure single sign-on for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={activeProvider || 'overview'}
            onValueChange={(value) => setActiveProvider(value)}
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {ssoProviders.map((provider) => (
                <TabsTrigger key={provider.id} value={provider.id}>
                  {provider.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-4">
                <Alert>
                  <AlertTitle>Getting Started with SSO</AlertTitle>
                  <AlertDescription>
                    Select a provider to configure SSO for your organization.
                    Once configured, users can sign in using their existing
                    corporate credentials.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {ssoProviders.map((provider) => (
                    <Card
                      key={provider.id}
                      className="cursor-pointer transition-all hover:border-primary"
                      onClick={() => setActiveProvider(provider.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          <CardTitle className="text-lg">
                            {provider.name}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="outline">Not Configured</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {ssoProviders.map((provider) => (
              <TabsContent key={provider.id} value={provider.id}>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          <CardTitle>{provider.name} Configuration</CardTitle>
                        </div>
                        <CardDescription>
                          Configure SSO settings for {provider.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="enabled"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Enable SSO</FormLabel>
                                <FormDescription>
                                  Allow users to sign in using {provider.name}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="enforceSSO"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Enforce SSO</FormLabel>
                                <FormDescription>
                                  Require all users to sign in using SSO
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="config.entityId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Entity ID</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="config.ssoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SSO URL</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="config.certificateData"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>X.509 Certificate</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Domain Restrictions</CardTitle>
                        <CardDescription>
                          Limit SSO access to specific email domains
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Alert>
                          <AlertDescription>
                            Domain restrictions help ensure that only users from
                            your organization can access your Spec Tree
                            instance. Users must have an email address from one
                            of the allowed domains to sign in.
                          </AlertDescription>
                        </Alert>

                        <div className="flex gap-2">
                          <Input
                            placeholder="example.com"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddDomain();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddDomain}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>

                        {fields.length > 0 ? (
                          <div className="space-y-2">
                            <FormLabel>Allowed Domains</FormLabel>
                            <div className="flex flex-wrap gap-2">
                              {fields.map((field, index) => (
                                <Badge
                                  key={field.id}
                                  variant="secondary"
                                  className="px-3 py-1 text-sm flex items-center gap-1"
                                >
                                  {field.domain}
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No domain restrictions configured. All domains are
                            allowed.
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                      >
                        Reset
                      </Button>
                      <Button type="submit" disabled={isConfiguring}>
                        {isConfiguring ? (
                          <>
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Configuration'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
