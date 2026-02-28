"use client";

import {
  Button,
  Checkbox,
  Field,
  Fieldset,
  HStack,
  Input,
  NativeSelect,
  SimpleGrid,
  Slider,
  Text,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { CalendarFormData, Genre } from "@/types";
import { calendarFormSchema } from "@/types";

const platforms = [
  { value: "pc", label: "PC" },
  { value: "playstation", label: "PlayStation" },
  { value: "xbox", label: "Xbox" },
  { value: "nintendo-switch", label: "Nintendo Switch" },
] as const;

const genres: { value: Genre; label: string }[] = [
  { value: "action", label: "Action" },
  { value: "rpg", label: "RPG" },
  { value: "adventure", label: "Adventure" },
  { value: "strategy", label: "Strategy" },
  { value: "shooter", label: "Shooter" },
  { value: "sports", label: "Sports" },
  { value: "puzzle", label: "Puzzle" },
  { value: "simulation", label: "Simulation" },
  { value: "horror", label: "Horror" },
];

const timePeriods = [
  { value: "1-month", label: "1 Month" },
  { value: "3-months", label: "3 Months" },
  { value: "6-months", label: "6 Months" },
] as const;

const playStyles = [
  { value: "casual", label: "Casual" },
  { value: "balanced", label: "Balanced" },
  { value: "hardcore", label: "Hardcore" },
] as const;

export function CalendarForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CalendarFormData>({
    resolver: zodResolver(calendarFormSchema),
    defaultValues: {
      name: "",
      platform: "pc",
      genres: [],
      hoursPerWeek: 10,
      timePeriod: "1-month",
      playStyle: "balanced",
    },
  });

  const onSubmit = (data: CalendarFormData) => {
    console.log("Calendar form data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack gap="8" align="stretch">
        {/* Calendar Name */}
        <Field.Root invalid={!!errors.name}>
          <Field.Label>Calendar Name</Field.Label>
          <Input placeholder="My Gaming Schedule" {...register("name")} />
          {errors.name && (
            <Field.ErrorText>{errors.name.message}</Field.ErrorText>
          )}
        </Field.Root>

        {/* Platform */}
        <Field.Root>
          <Field.Label>Platform</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field {...register("platform")}>
              {platforms.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>

        {/* Genres */}
        <Controller
          name="genres"
          control={control}
          render={({ field, fieldState }) => (
            <Fieldset.Root invalid={!!fieldState.error}>
              <Fieldset.Legend>Genres</Fieldset.Legend>
              <SimpleGrid columns={{ base: 2, md: 3 }} gap="3" mt="2">
                {genres.map((genre) => (
                  <Checkbox.Root
                    key={genre.value}
                    checked={field.value.includes(genre.value)}
                    onCheckedChange={(details) => {
                      const checked = details.checked;
                      const updated = checked
                        ? [...field.value, genre.value]
                        : field.value.filter((g) => g !== genre.value);
                      field.onChange(updated);
                    }}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>{genre.label}</Checkbox.Label>
                  </Checkbox.Root>
                ))}
              </SimpleGrid>
              {fieldState.error && (
                <Fieldset.ErrorText>
                  {fieldState.error.message}
                </Fieldset.ErrorText>
              )}
            </Fieldset.Root>
          )}
        />

        {/* Hours per Week */}
        <Controller
          name="hoursPerWeek"
          control={control}
          render={({ field }) => (
            <Field.Root>
              <HStack justify="space-between" w="full">
                <Field.Label mb="0">Hours per Week</Field.Label>
                <Text fontWeight="medium" color="accent">
                  {field.value}h
                </Text>
              </HStack>
              <Slider.Root
                w="full"
                min={1}
                max={40}
                step={1}
                value={[field.value]}
                onValueChange={(details) => field.onChange(details.value[0])}
              >
                <Slider.Control>
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumbs />
                </Slider.Control>
                <Slider.MarkerGroup mt={3}>
                  <Slider.Marker value={1}>
                    <Slider.MarkerLabel>1h</Slider.MarkerLabel>
                  </Slider.Marker>
                  <Slider.Marker value={20}>
                    <Slider.MarkerLabel>20h</Slider.MarkerLabel>
                  </Slider.Marker>
                  <Slider.Marker value={40}>
                    <Slider.MarkerLabel>40h</Slider.MarkerLabel>
                  </Slider.Marker>
                </Slider.MarkerGroup>
              </Slider.Root>
            </Field.Root>
          )}
        />

        {/* Time Period */}
        <Field.Root>
          <Field.Label>Time Period</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field {...register("timePeriod")}>
              {timePeriods.map((tp) => (
                <option key={tp.value} value={tp.value}>
                  {tp.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>

        {/* Play Style */}
        <Field.Root>
          <Field.Label>Play Style</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field {...register("playStyle")}>
              {playStyles.map((ps) => (
                <option key={ps.value} value={ps.value}>
                  {ps.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          colorPalette="purple"
          alignSelf="flex-start"
        >
          Generate Calendar
        </Button>
      </VStack>
    </form>
  );
}
