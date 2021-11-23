# frozen_string_literal: true

#
# Copyright (C) 2013 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.

module I18nTasks
  module Utils
    CORE_KEYS = %i[date time number datetime support].freeze

    # From https://stackoverflow.com/a/64981412
    def self.deep_compact(hash)
      res_hash = hash.map do |key, value|
        value = deep_compact(value) if value.is_a?(Hash)

        value = nil if [{}, []].include?(value)
        [key, value]
      end

      res_hash.to_h.compact
    end

    def self.dump_js(translations)
      <<~JS.gsub(/^ {8}/, '')
        // this file was auto-generated by rake i18n:generate_js.
        // you probably shouldn't edit it directly
        import mergeI18nTranslations from '@canvas/i18n/mergeI18nTranslations.js';

        // we use JSON.parse here instead of just loading it as a javascript object literal
        // because according to https://v8.dev/blog/cost-of-javascript-2019#json that is faster
        mergeI18nTranslations(JSON.parse(#{deep_compact(translations).to_ordered.to_json.inspect}));
      JS
    end
  end
end
