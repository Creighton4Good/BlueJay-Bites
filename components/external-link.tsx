import { Href, Link } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

/**
 * Cross-platform external-link wrapper.
 * 
 * On web, this behaves like a normal link and opens in a new browser tab.
 * On native platforms, the default navigation is intercepted and the URL is opened inside an in-app browser instead.
 */
export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        if (process.env.EXPO_OS !== 'web') {
          // Prevent Expo Router from handling the link as normal navigation.
          event.preventDefault();
          
          // Open external content in an in-app browser on native platforms.
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
        }
      }}
    />
  );
}
