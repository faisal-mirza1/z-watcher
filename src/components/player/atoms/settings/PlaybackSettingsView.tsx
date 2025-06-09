import classNames from 'classnames';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Toggle } from '@/components/buttons/Toggle';
import { Menu } from '@/components/player/internals/ContextMenu';
import { useOverlayRouter } from '@/hooks/useOverlayRouter';
import { usePlayerStore } from '@/stores/player/store';
import { usePreferencesStore } from '@/stores/preferences';
import { useWatchPartyStore } from '@/stores/watchParty';

function ButtonList(props: {
  options: number[];
  selected: number;
  onClick: (v: any) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center bg-video-context-light/10 p-1 rounded-lg">
      {props.options.map((option) => {
        return (
          <button
            type="button"
            disabled={props.disabled}
            className={classNames(
              'w-full px-2 py-1 rounded-md tabbable',
              props.selected === option
                ? 'bg-video-context-light/20 text-white'
                : null,
              props.disabled ? 'opacity-50 cursor-not-allowed' : null,
            )}
            onClick={() => props.onClick(option)}
            key={option}
          >
            {option}x
          </button>
        );
      })}
    </div>
  );
}

export function PlaybackSettingsView({ id }: { id: string }) {
  const { t } = useTranslation();
  const router = useOverlayRouter(id);
  const playbackRate = usePlayerStore((s) => s.mediaPlaying.playbackRate);
  const display = usePlayerStore((s) => s.display);
  const enableThumbnails = usePreferencesStore((s) => s.enableThumbnails);
  const setEnableThumbnails = usePreferencesStore((s) => s.setEnableThumbnails);
  const isInWatchParty = useWatchPartyStore((s) => s.enabled);

  const setPlaybackRate = useCallback(
    (v: number) => {
      if (isInWatchParty) return; // Don't allow changes in watch party
      display?.setPlaybackRate(v);
    },
    [display, isInWatchParty],
  );

  // Force 1x speed in watch party
  useEffect(() => {
    if (isInWatchParty && display && playbackRate !== 1) {
      display.setPlaybackRate(1);
    }
  }, [isInWatchParty, display, playbackRate]);

  const options = [0.25, 0.5, 1, 1.5, 2];

  return (
    <>
      <Menu.BackLink onClick={() => router.navigate('/')}>
        {t('player.menus.playback.title')}
      </Menu.BackLink>
      <Menu.Section>
        <div className="space-y-4 mt-3">
          <Menu.FieldTitle>
            {t('player.menus.playback.speedLabel')}
            {isInWatchParty && (
              <span className="text-sm text-type-secondary ml-2">
                {t('player.menus.playback.disabled')}
              </span>
            )}
          </Menu.FieldTitle>
          <ButtonList
            options={options}
            selected={isInWatchParty ? 1 : playbackRate}
            onClick={setPlaybackRate}
            disabled={isInWatchParty}
          />
        </div>
      </Menu.Section>
      <Menu.Section>
        <div className="space-y-4 mt-3">
          <Menu.Link
            rightSide={
              <Toggle
                enabled={enableThumbnails}
                onClick={() => setEnableThumbnails(!enableThumbnails)}
              />
            }
          >
            {t('settings.preferences.thumbnailLabel')}
          </Menu.Link>
        </div>
      </Menu.Section>
    </>
  );
}
