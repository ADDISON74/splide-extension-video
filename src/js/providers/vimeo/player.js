/**
 * The class for controlling Vimeo video.
 *
 * @author    Naotoshi Fujita
 * @copyright Naotoshi Fujita. All rights reserved.
 */

import VimeoPlayer from '@vimeo/player';
import BasePlayer from '../base/base-player';
import { NOT_INITIALIZED, PLAY_REQUEST_ABORTED, PLAYING } from "../../constants/states";

/**
 * The class for controlling Vimeo video.
 */
export default class Player extends BasePlayer {
	/**
	 * Create a player.
	 * This must be overridden in a child class.
	 *
	 * @param {function} readyCallback - Callback function triggered when the player gets ready.
	 *
	 * @return {object|null} - A created player object.
	 */
	createPlayer( readyCallback = null ) {
		const options = this.Splide.options.video;

		const player = new VimeoPlayer( this.elements.iframe, {
			id      : this.videoId,
			controls: ! options.hideControls,
			loop    : options.loop,
		} );

		player.on( 'play', this.onPlay.bind( this ) );
		player.on( 'pause', this.onPause.bind( this ) );
		player.on( 'end', this.onEnd.bind( this ) );

		if ( options.mute ) {
			player.setMuted( true );
		}

		if ( readyCallback ) {
			// Fire callback on the next tick to keep the order of "return -> callback".
			player.ready().then( readyCallback );
		}

		return player;
	}

	/**
	 * Find the video ID from the HTML.
	 *
	 * @return {string} - Video ID.
	 */
	findVideoId(){
		const url    = this.slide.getAttribute( 'data-splide-vimeo' );
		const regExp = /vimeo.com\/(\d+)/;
		const match  = url.match( regExp );

		return ( match && match[ 1 ] ) ? match[1] : '';
	}

	/**
	 * Called when the player is playing a video.
	 */
	onPlay() {
		if ( this.state.is( PLAY_REQUEST_ABORTED ) && ! this.isActive() ) {
			this.player.destroy();
			this.elements.show();
			this.state.set( NOT_INITIALIZED );
		} else {
			this.Splide.emit( 'video:play', this );
			this.state.set( PLAYING );
		}
	}
}